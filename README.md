# Медицинский портал

Монорепозиторий с микросервисной архитектурой:

| Пакет | Тип | Dev-порт | Prod-порт |
|---|---|---|---|
| `apps/backend-auth` | NestJS | 4000 | 4000 |
| `apps/backend-api` | NestJS | 4001 | 4001 |
| `apps/frontend-host` | React Host MFE | 3000 | 80 (Nginx) |
| `apps/mfe-appointments` | React Remote MFE | 3001 | 80/appointments |
| `apps/mfe-medcard` | React Remote MFE | 3002 | 80/medcard |
| `packages/shared-webpack` | Общая конфигурация Webpack | — | — |

PostgreSQL крутится на `localhost:5432` (пользователь `med`, пароль `med`, база `med`).

---

## Первый запуск

```powershell
npm install
```

Будут установлены все workspaces (5 приложений + 1 пакет).

---

## Режим разработки

В dev-режиме фронтенды поднимаются на webpack-dev-server с горячей перезагрузкой, бэкенды — через `nest start --watch`. В Docker крутится **только PostgreSQL**.

### Быстрый старт одной командой

```powershell
.\scripts\dev.ps1
```

Этот скрипт поднимает Postgres в Docker, дожидается готовности базы и запускает все 5 сервисов параллельно через `concurrently`.

### Или вручную

```powershell
npm run db:up
npm run dev
```

`npm run dev` запускает в одном терминале сразу:
- `dev:auth` — backend-auth с watch
- `dev:api` — backend-api с watch
- `dev:host` — frontend-host (webpack-dev-server)
- `dev:appointments` — mfe-appointments
- `dev:medcard` — mfe-medcard

Логи раскрашены и помечены префиксами (`auth`, `api`, `host`, `appts`, `medcard`).

### Адреса в dev-режиме

- Фронтенд: http://localhost:3000
- Auth API: http://localhost:4000 (Swagger — http://localhost:4000/api/docs)
- Main API: http://localhost:4001 (Swagger — http://localhost:4001/api/docs)
- Postgres: `localhost:5432`

### Остановка

`Ctrl+C` в терминале с `npm run dev`, затем:

```powershell
npm run db:down
```

или скриптом:

```powershell
.\scripts\stop.ps1
```

### Запуск отдельных сервисов

Если нужно перезапустить только один сервис, открой второй терминал:

```powershell
npm run dev:auth
npm run dev:api
npm run dev:host
npm run dev:appointments
npm run dev:medcard
```

---

## Продакшн-режим

Полная сборка: Postgres + оба бэкенда + Nginx с тремя собранными фронтендами в одном контейнере.

```powershell
npm run prod:up
```

Это `docker-compose up --build` — соберутся образы и поднимется весь стек.

### Адреса в prod-режиме

- Фронтенд: http://localhost (порт 80, Nginx)
- Auth API: http://localhost:4000
- Main API: http://localhost:4001

### Логи и остановка

```powershell
npm run prod:logs
npm run prod:down
```

---

## Сводка npm-скриптов

| Команда | Что делает |
|---|---|
| `npm run db:up` | Поднять только PostgreSQL в Docker |
| `npm run db:down` | Остановить PostgreSQL |
| `npm run db:logs` | Логи PostgreSQL |
| `npm run dev` | Запустить все 5 сервисов локально (нужна поднятая база) |
| `npm run dev:auth` / `dev:api` / `dev:host` / `dev:appointments` / `dev:medcard` | Запустить один сервис |
| `npm run build:all` | Собрать все приложения |
| `npm run prod:up` | Собрать и запустить весь стек в Docker |
| `npm run prod:down` | Остановить prod-стек |
| `npm run prod:logs` | Логи prod-стека |

---

## Переменные окружения

Скопируй `.env.example` в `.env` и при необходимости поменяй значения. В Docker-режиме переменные пробрасываются из `docker-compose.yml`, в dev-режиме код использует дефолты, совпадающие с `.env.example`.

---

## Типичный рабочий цикл

1. С утра: `.\scripts\dev.ps1` — поднялась база и все сервисы.
2. Правишь код — backend и frontend перезагружаются автоматически.
3. Перед коммитом: `npm run build:all` — проверка сборки.
4. Перед релизом: `npm run prod:up` — финальная проверка в Docker.
