.PHONY: start start-awake awake stop status last cycles monitor health alerts compare trend selftest pause resume install uninstall team watcher dashboard dashboard-build docker-start docker-stop docker-logs help

# === Quick Start ===

start: ## Start the auto-loop in foreground
	./auto-loop.sh

start-awake: ## Start loop and prevent macOS sleep while running
	caffeinate -d -i -s $(MAKE) start

awake: ## Prevent macOS sleep while current loop PID is running
	@test -f .auto-loop.pid || (echo "No .auto-loop.pid found. Run 'make start' first."; exit 1)
	@pid=$$(cat .auto-loop.pid); \
	echo "Keeping Mac awake while PID $$pid is running..."; \
	caffeinate -d -i -s -w $$pid

stop: ## Stop the loop gracefully
	./stop-loop.sh

# === Monitoring ===

status: ## Show loop status + latest consensus
	./monitor.sh --status

last: ## Show last cycle's full output
	./monitor.sh --last

cycles: ## Show cycle history summary
	./monitor.sh --cycles

monitor: ## Tail live logs (Ctrl+C to exit)
	./monitor.sh

health: ## Combined health check (status + alerts + uptime)
	./monitor.sh --health

alerts: ## Check for failures, cost spikes, stalls
	./monitor.sh --alerts

compare: ## Compare cost/duration across models
	./monitor.sh --compare

trend: ## Cost & duration trend with sparklines
	./monitor.sh --trend

selftest: ## Run self-test (verify loop, monitor, consensus integrity)
	./auto-loop.sh --selftest

# === Daemon (launchd) ===

install: ## Install launchd daemon (auto-start + crash recovery)
	./install-daemon.sh

uninstall: ## Remove launchd daemon
	./install-daemon.sh --uninstall

pause: ## Pause daemon (no auto-restart)
	./stop-loop.sh --pause-daemon

resume: ## Resume paused daemon
	./stop-loop.sh --resume-daemon

# === Interactive ===

team: ## Start interactive Claude session with /team skill
	cd "$(CURDIR)" && claude

watcher: ## Start Telegram escalation watcher
	node watcher.js

dashboard: ## Build and start the Next.js dashboard
	@test -d dashboard || (echo "Error: dashboard/ directory not found."; exit 1)
	cd dashboard && npm install && npm run dev

dashboard-build: ## Build dashboard for production
	@test -d dashboard || (echo "Error: dashboard/ directory not found."; exit 1)
	cd dashboard && npm install && npm run build

# === Docker ===

docker-start: ## Start auto-co stack via Docker Compose (loop + optional watcher/dashboard)
	docker compose up -d loop
	@echo "Loop started. To also start watcher: docker compose --profile watcher up -d"
	@echo "To also start dashboard: docker compose --profile dashboard up -d"

docker-stop: ## Stop and remove all Docker Compose services
	docker compose --profile watcher --profile dashboard down

docker-logs: ## Tail Docker loop logs (Ctrl+C to exit)
	docker compose logs -f loop

# === Maintenance ===

clean-logs: ## Remove all cycle logs
	rm -f logs/cycle-*.log logs/auto-loop.log.old
	@echo "Cycle logs cleaned."

reset-consensus: ## Reset consensus to initial Day 0 state (CAUTION)
	@echo "This will reset all company progress. Ctrl+C to cancel."
	@sleep 3
	git checkout -- memories/consensus.md
	@echo "Consensus reset to initial state."

# === Help ===

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
