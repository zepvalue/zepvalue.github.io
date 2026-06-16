# zepvalue.github.io — common tasks
# GitHub Pages builds automatically on push to `master`, so `make deploy`
# just verifies the build, commits, and pushes.

.PHONY: help setup install serve test build deploy clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

setup: ## First-time setup: install Ruby gems dir, Bundler, and project deps
	@echo "Configuring gem home in ~/.bashrc ..."
	@grep -q 'GEM_HOME' ~/.bashrc || printf '\n# Ruby gems\nexport GEM_HOME="$$HOME/gems"\nexport PATH="$$HOME/gems/bin:$$PATH"\n' >> ~/.bashrc
	@export GEM_HOME="$$HOME/gems" && export PATH="$$HOME/gems/bin:$$PATH" && \
		echo "Installing Bundler ..." && gem install bundler --no-document && \
		echo "Installing project gems ..." && bundle install
	@echo ""
	@echo "Done. Run:  source ~/.bashrc  (or open a new terminal), then: make serve"

install: ## Install Ruby gem dependencies (run after setup)
	bundle install

serve: ## Run the site locally with live reload (http://localhost:4000)
	bundle exec jekyll serve --livereload --open-url

test: build ## Build and check the site for broken output (CI-friendly)
	@echo "Build OK — output in _site/"

build: ## Build the static site into _site/
	bundle exec jekyll build

deploy: build ## Verify build, then commit & push to master (triggers Pages deploy)
	@if [ -z "$$(git status --porcelain)" ]; then \
		echo "Nothing to deploy — working tree is clean."; \
	else \
		git add -A && \
		git commit -m "$(or $(m),Update site)" && \
		git push origin master && \
		echo "Pushed — GitHub Pages will rebuild shortly."; \
	fi

clean: ## Remove generated files
	bundle exec jekyll clean
