CREATE TYPE "game"."play_status" AS ENUM('initiated', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "game"."plays" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"play_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"bet_amount" numeric(10, 2) NOT NULL,
	"win_amount" numeric(10, 2),
	"game" text NOT NULL,
	"status" "game"."play_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "plays_walletId_playId_status_unique" UNIQUE("wallet_id","play_id","status")
);
--> statement-breakpoint
CREATE INDEX "plays_play_id_index" ON "game"."plays" USING btree ("play_id");--> statement-breakpoint
CREATE INDEX "plays_wallet_id_status_created_at_idx" ON "game"."plays" USING btree ("wallet_id","status","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "plays_wallet_id_game_status_created_at_idx" ON "game"."plays" USING btree ("wallet_id","game","status","created_at" DESC NULLS LAST);