CREATE TABLE "cafes" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"area" text NOT NULL,
	"address" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"wifi_name" text,
	"wifi_password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cafes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"cafe_id" text NOT NULL,
	"author" text NOT NULL,
	"comment" text,
	"wifi" integer NOT NULL,
	"coffee" integer NOT NULL,
	"outlets" integer NOT NULL,
	"meetings" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_cafe_id_cafes_id_fk" FOREIGN KEY ("cafe_id") REFERENCES "public"."cafes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cafes_slug_idx" ON "cafes" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "reviews_cafe_id_idx" ON "reviews" USING btree ("cafe_id");