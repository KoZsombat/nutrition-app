-- =============================================================
-- Nutrition App — Database Schema
-- MySQL 8.0+
-- Run this script once to set up the database for development.
-- =============================================================

CREATE DATABASE IF NOT EXISTS nutrition_app
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE nutrition_app;

-- ---------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user (
  id          INT          NOT NULL AUTO_INCREMENT,
  username    VARCHAR(100) NOT NULL UNIQUE,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255)     NULL,          -- NULL for Google-only accounts
  nationality VARCHAR(100) NOT NULL DEFAULT 'United States',
  google_id   VARCHAR(255)     NULL UNIQUE,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Personal macro targets
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nut_values (
  id       INT     NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE,
  calories FLOAT   NOT NULL DEFAULT 2000,
  protein  FLOAT   NOT NULL DEFAULT 100,
  carbs    FLOAT   NOT NULL DEFAULT 300,
  fat      FLOAT   NOT NULL DEFAULT 70,
  PRIMARY KEY (id),
  CONSTRAINT fk_nut_user FOREIGN KEY (username) REFERENCES user (username)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Custom ingredients created by the user (per 100 g)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food (
  id       INT          NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  name     VARCHAR(255) NOT NULL,
  calories FLOAT        NOT NULL DEFAULT 0,
  protein  FLOAT        NOT NULL DEFAULT 0,
  carbs    FLOAT        NOT NULL DEFAULT 0,
  fat      FLOAT        NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_food_user FOREIGN KEY (username) REFERENCES user (username)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Named meals (collections of ingredients)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meal (
  id       INT          NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  name     VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_meal_user FOREIGN KEY (username) REFERENCES user (username)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Ingredients that belong to a meal (grams stored per ingredient)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meal_food (
  id      INT          NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  meal_id INT          NOT NULL,
  food    VARCHAR(255) NOT NULL,
  grams   VARCHAR(50)  NOT NULL DEFAULT '0',
  PRIMARY KEY (id),
  CONSTRAINT fk_mf_meal FOREIGN KEY (meal_id) REFERENCES meal (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Meals logged as eaten today (cleared when the user saves the day)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eaten_meal (
  id       INT          NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  meal     VARCHAR(255) NOT NULL,
  gram     FLOAT        NOT NULL DEFAULT 100,
  PRIMARY KEY (id),
  CONSTRAINT fk_eaten_user FOREIGN KEY (username) REFERENCES user (username)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Daily history snapshots (saved when user clears the day)
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS eaten_history (
  id       INT          NOT NULL AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL,
  date     DATETIME     NOT NULL,
  calories FLOAT        NOT NULL DEFAULT 0,
  protein  FLOAT        NOT NULL DEFAULT 0,
  carbs    FLOAT        NOT NULL DEFAULT 0,
  fat      FLOAT        NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_hist_user FOREIGN KEY (username) REFERENCES user (username)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------
-- Global product database (barcode / name search)
-- Populated separately — not created per user.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id       INT           NOT NULL AUTO_INCREMENT,
  barcode  VARCHAR(50)       NULL UNIQUE,
  name     VARCHAR(255)  NOT NULL,
  calories FLOAT         NOT NULL DEFAULT 0,
  protein  FLOAT         NOT NULL DEFAULT 0,
  carbs    FLOAT         NOT NULL DEFAULT 0,
  fat      FLOAT         NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  INDEX idx_products_name    (name),
  INDEX idx_products_barcode (barcode)
) ENGINE=InnoDB;
