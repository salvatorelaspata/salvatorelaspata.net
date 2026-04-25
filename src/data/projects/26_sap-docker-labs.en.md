# SAP Docker Labs 🐳

**Category:** Shady Projects
**Technologies:** Docker, SAP NetWeaver ABAP, SAP WebIDE, SAP Cloud Connector, Linux

## What is it

A collection of experiments to containerize SAP environments that normally require entire days of setup, enterprise licenses, and a considerable amount of patience.

The goal is simple: `docker run` and you have a working SAP environment locally. No 47-step installer wizards, no obscure Windows Server 2008 dependencies, no ritual sacrifices.

## What has been containerized

- **SAP NetWeaver AS ABAP Developer Edition 7.52** — the classic local ABAP environment, dockerized to run on Linux without touching anything on the host system
- **SAP WebIDE** — the browser-based IDE for SAPUI5/Fiori development, isolated in a container to keep your system clean
- **SAP Cloud Connector** — the bridge between SAP BTP and on-premise systems, in Docker for test environments and CI/CD pipelines

## Why "shady"

SAP doesn't officially encourage these setups. Official documentation suggests dedicated VMs, certified operating systems, and elaborate manual configurations. We prefer a `docker-compose up`.

> ⚠️ For development and test environments only. Not for production. Obviously.
