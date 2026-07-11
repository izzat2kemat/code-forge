-- Cengkerik Database Schema & Seed Script
-- You do not need to run this manually if you run the Nuxt application locally with XAMPP MySQL running,
-- as the application will automatically create and seed this database on startup.

CREATE DATABASE IF NOT EXISTS `cengkerik`;
USE `cengkerik`;

-- 1. Table structure for table `projects`
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `github_url` VARCHAR(255) DEFAULT NULL,
  `demo_url` VARCHAR(255) DEFAULT NULL,
  `tags` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table structure for table `articles`
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT NOT NULL,
  `content` TEXT NOT NULL,
  `image_url` VARCHAR(255) NOT NULL,
  `read_time` VARCHAR(50) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `published_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Seed data for table `projects`
INSERT INTO `projects` (`title`, `description`, `image_url`, `github_url`, `demo_url`, `tags`) 
SELECT * FROM (
  SELECT 
    'NeuroForge: Autonomous AI Agents Framework' AS title, 
    'A cutting-edge orchestrator for deploying collaborative multi-agent AI networks. It utilizes semantic routing, local memory caching, and self-healing terminal executors to write, test, and refactor code autonomously.' AS description, 
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' AS image_url, 
    'https://github.com/izzat2kemat/neuroforge' AS github_url, 
    'https://neuroforge.cengkerik.ai' AS demo_url, 
    'AI Agents,LLMs,TypeScript,LangChain' AS tags
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM `projects` LIMIT 1
);

INSERT INTO `projects` (`title`, `description`, `image_url`, `github_url`, `demo_url`, `tags`) 
SELECT * FROM (
  SELECT 
    'LexiChat: Privacy-First Local RAG Client' AS title, 
    'An enterprise-grade document search assistant that operates entirely client-side or on private servers. Implements Vector search, hybrid BM25 lexical search, and high-performance WebGPU model execution.' AS description, 
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80' AS image_url, 
    'https://github.com/izzat2kemat/lexichat' AS github_url, 
    'https://lexichat.cengkerik.ai' AS demo_url, 
    'RAG,Vector DB,WebGPU,Nuxt 3' AS tags
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM `projects` WHERE `title` = 'LexiChat: Privacy-First Local RAG Client'
);

INSERT INTO `projects` (`title`, `description`, `image_url`, `github_url`, `demo_url`, `tags`) 
SELECT * FROM (
  SELECT 
    'Cengkerik-Vision: Edge Insect Detection' AS title, 
    'An IoT vision pipeline optimized for Raspberry Pi and Jetson Nano, leveraging quantized YOLOv8 models to monitor and classify nocturnal insect activities with low latency and power consumption.' AS description, 
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80' AS image_url, 
    'https://github.com/izzat2kemat/cengkerik-vision' AS github_url, 
    NULL AS demo_url, 
    'Computer Vision,YOLOv8,Python,IoT' AS tags
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM `projects` WHERE `title` = 'Cengkerik-Vision: Edge Insect Detection'
);

-- 4. Seed data for table `articles`
INSERT INTO `articles` (`title`, `summary`, `content`, `image_url`, `read_time`, `category`) 
SELECT * FROM (
  SELECT 
    'The Rise of Agentic Coding: Beyond CoPilot' AS title, 
    'Explore how software engineering is transforming with autonomous AI agents that don\'t just autocomplete lines, but plan complex tasks, execute commands, run tests, and refactor files.' AS summary, 
    'Artificial Intelligence has rapidly moved from simple syntax helpers to full agentic workflows. In this article, we detail the anatomy of autonomous coding agents, how they decompose tasks, use search tools, and self-heal from terminal errors. We look at the architectural patterns that govern their system interactions and safety guardrails.' AS content, 
    'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80' AS image_url, 
    '5 min read' AS read_time, 
    'Agentic AI' AS category
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM `articles` LIMIT 1
);

INSERT INTO `articles` (`title`, `summary`, `content`, `image_url`, `read_time`, `category`) 
SELECT * FROM (
  SELECT 
    'Fine-Tuning vs RAG: Choosing Your LLM Strategy' AS title, 
    'Should you fine-tune a model on your data or feed it dynamically through Retrieval-Augmented Generation? A deep dive into cost, performance, and complexity.' AS summary, 
    'Deciding between Fine-Tuning and Retrieval-Augmented Generation (RAG) is a critical technical choice for modern AI applications. Fine-tuning updates the weights of a model, embedding behavior and tone, whereas RAG dynamically fetches ground-truth context at runtime. We analyze the latency, storage, cost, and reliability metrics of both approaches.' AS content, 
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' AS image_url, 
    '8 min read' AS read_time, 
    'Architecture' AS category
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM `articles` WHERE `title` = 'Fine-Tuning vs RAG: Choosing Your LLM Strategy'
);

INSERT INTO `articles` (`title`, `summary`, `content`, `image_url`, `read_time`, `category`) 
SELECT * FROM (
  SELECT 
    'Optimizing Small Language Models for WebGPU' AS title, 
    'Running 3B and 7B models inside the user\'s browser is now a reality. Learn how WebGPU and ONNX Runtime enable private, instant AI inference on web apps.' AS summary, 
    'With the arrival of powerful small language models (SLMs) like Phi-3 and Llama-3-8B, client-side inference is taking off. By leveraging WebGPU APIs, web applications can offload computational tasks directly to the user\'s graphic hardware. This guide covers quantization formats, ONNX runtimes, and local memory lifecycle management.' AS content, 
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80' AS image_url, 
    '6 min read' AS read_time, 
    'WebGPU' AS category
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM `articles` WHERE `title` = 'Optimizing Small Language Models for WebGPU'
);
