# 🏥 ProClinic (RIS) & ProRadVox (Worklist)

## 📌 Visão Geral
O **ProClinic** é uma solução completa de gestão radiológica (RIS - Radiology Information System) desenvolvida para otimizar o fluxo de clínicas de diagnóstico por imagem.

O sistema opera integrado ao **ProRadVox**, um servidor DICOM Worklist (Broker) que conecta o agendamento administrativo diretamente às modalidades de imagem (CR, MR, CT, US), eliminando a dupla digitação de dados.

---

## 🏗️ Arquitetura e Tecnologias

O projeto utiliza uma arquitetura de microsserviços containerizados via **Docker Compose**.

### 💻 Stack Tecnológica
* **Frontend:** React 18 (Vite + TypeScript + TailwindCSS)
* **Backend:** .NET 8 (C#) com Entity Framework Core
* **Banco de Dados:** PostgreSQL 15 (Imagem Alpine)
* **Worklist Server:** Python (`pynetdicom` + `psycopg2`)
* **Infraestrutura:** Docker & Docker Compose

### 🔄 Fluxo de Dados
1. **Agendamento:** Recepcionista agenda o exame no ProClinic (Web).
2. **Confirmação:** Ao confirmar (Check-in), os dados são gravados no PostgreSQL.
3. **Worklist:** O servidor Python monitora o banco. Quando o equipamento (ex: Raio-X) pede a lista de pacientes, o servidor envia os dados via protocolo DICOM.
4. **Faturamento:** O sistema gera guias TISS (XML 4.01.00) validadas para envio aos convênios.

---

## 🚀 Como Rodar o Projeto (Deploy)

### Pré-requisitos
* Docker e Docker Compose instalados.
* Git instalado.

### 1. Clonar e Iniciar
```bash
git clone [https://github.com/SEU_USUARIO/sistema-proclinic.git](https://github.com/SEU_USUARIO/sistema-proclinic.git)
cd sistema-proclinic

# Subir todos os containers (Banco, API, Front e Worklist)
docker compose up -d --build
