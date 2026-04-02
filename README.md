# ⚡️ Electric Avenue V2

Modern E-commerce platform

---

## 🚀 CI/CD and Deployment

The project uses GitHub Actions for automatic Docker image building and server deployment. To ensure the pipeline works correctly, configure the following **GitHub Secrets** in the repository settings:

| Secret Name | Description | Purpose |
| :--- | :--- | :--- |
| `DOCKER_USERNAME` | Docker Hub login | For authentication and pushing built images (`backend`, `frontend`). |
| `DOCKER_PASSWORD` | Password / Access Token | Provides secure access to your Docker registry. |
| `SERVER_HOST` | IP address or domain | Specifies the target server (ARM/AMD64) for deployment. |
| `SERVER_USER` | Server login | Username for SSH connection (e.g., `root` or `ubuntu`). |
| `SERVER_SSH_KEY` | Private SSH key | PEM formatted key for passwordless connection to the server. |

---

## 🔄 CDC (Change Data Capture) Architecture

**Elasticsearch** is used for full-text search, autocomplete, and faceted filtering (Aggregations). To avoid the *Dual Write* anti-pattern (where application code attempts to write to both the DB and the search index simultaneously) and to guarantee 100% data consistency, synchronization is implemented via the **CDC** pattern using **Debezium**.

Since the project is optimized for resource-constrained ARM servers, we use `Debezium Server` coupled with `Redis Streams`, completely abandoning the heavy Apache Kafka ecosystem (ZooKeeper/KRaft).



### 🌊 Data Flow

1. **PostgreSQL (Source of Truth)**
   Logical replication is enabled in the database (`wal_level=logical`). The main NestJS API performs standard queries via Prisma (create, update, delete products). Any change in the `products` table is instantly recorded in the database's Write-Ahead Log (WAL).

2. **Debezium Server (Interceptor)**
   A lightweight Java container that connects to the PostgreSQL replication slot. It reads the WAL log in real-time, captures changes, transforms them into JSON events (with `op`, `before`, `after` fields), and pushes them directly to Redis.
   *(To save memory, transmission of the full table schema is disabled: `schemas.enable=false`).*

3. **Redis Streams (Lightweight Broker)**
   Events are stored in a stream. Redis guarantees that events are saved to disk and wait for their consumer, acting as a full-fledged message queue.

4. **NestJS Worker (Consumer)**
   A dedicated `RedisStreamConsumerService` runs in the background of NestJS. It:
    * Continuously listens to the stream for new events (BLOCK).
    * Safely parses JSON (handling *Poison Pills*).
    * Retrieves the full product tree with relations from Prisma if necessary.
    * Maps the data and sends it to Elasticsearch.
    * Acknowledges successful event processing (`XACK`), removing it from the queue.

### 🛡 Fault Tolerance (Resilience)

The system is designed with the assumption that any node can temporarily fail:

* **If Debezium goes down:** PostgreSQL "holds" unsent logs in the replication slot. Upon restart, Debezium simply resumes reading from where it left off. No data is lost.
* **If NestJS / Worker goes down:** Events safely accumulate in Redis Streams. Upon startup, the backend will read all pending messages and synchronize with Elastic.
* **If Elasticsearch goes down:** The worker catches the error and **does not** `ACK` the message. It falls into the `Pending` list. A background process runs in the application, automatically and periodically checking the `Pending` list and retrying synchronization (Retry Mechanism) until Elastic recovers.