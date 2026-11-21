.PHONY: setup dev build test coverage up down ci

setup:
	npm install
	cd client && npm install
	npx prisma generate
	npx prisma db push

dev:
	npm run dev

build:
	npm run build

test:
	npm run test

coverage:
	npm run test:coverage

up:
	docker compose up --build -d

down:
	docker compose down

ci: test coverage build
