import mysql from 'mysql2/promise'
import { getSetupConnection } from '../utils/db'

export default defineNitroPlugin(async () => {
  console.log('[Cengkerik DB Init] Starting database auto-initialization...')
  let connection;
  const dbName = process.env.DB_NAME || 'cengkerik'
  try {
    // Try connecting directly first (handles remote database case like Wasmer where DB already exists)
    try {
      console.log(`[Cengkerik DB Init] Attempting direct connection to database "${dbName}"...`)
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: dbName,
        port: Number(process.env.DB_PORT) || 3306,
      }
      connection = await mysql.createConnection(dbConfig)
      console.log(`[Cengkerik DB Init] Successfully connected to existing database "${dbName}".`)
    } catch (connError: any) {
      // If error is "Unknown database", try to create it (handles local XAMPP case)
      if (connError.errno === 1049 || connError.code === 'ER_BAD_DB_ERROR') {
        console.log(`[Cengkerik DB Init] Database "${dbName}" does not exist. Attempting to create it...`)
        connection = await getSetupConnection()
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
        await connection.query(`USE \`${dbName}\``)
        console.log(`[Cengkerik DB Init] Created and switched to database "${dbName}".`)
      } else {
        throw connError
      }
    }
    
    // 4. Create projects table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        github_url VARCHAR(255),
        demo_url VARCHAR(255),
        tags VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('[Cengkerik DB Init] "projects" table verified/created.')
    
    // 5. Create articles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        read_time VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('[Cengkerik DB Init] "articles" table verified/created.')

    // 6. Seed projects if empty
    const [projectRows] = await connection.query('SELECT COUNT(*) as count FROM projects')
    if ((projectRows as any)[0].count === 0) {
      console.log('[Cengkerik DB Init] Seeding "projects" table...')
      const projects = [
        {
          title: 'NeuroForge: Autonomous AI Agents Framework',
          description: 'A cutting-edge orchestrator for deploying collaborative multi-agent AI networks. It utilizes semantic routing, local memory caching, and self-healing terminal executors to write, test, and refactor code autonomously.',
          image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          github_url: 'https://github.com/izzat2kemat/neuroforge',
          demo_url: 'https://neuroforge.cengkerik.ai',
          tags: 'AI Agents,LLMs,TypeScript,LangChain'
        },
        {
          title: 'LexiChat: Privacy-First Local RAG Client',
          description: 'An enterprise-grade document search assistant that operates entirely client-side or on private servers. Implements Vector search, hybrid BM25 lexical search, and high-performance WebGPU model execution.',
          image_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=800&q=80',
          github_url: 'https://github.com/izzat2kemat/lexichat',
          demo_url: 'https://lexichat.cengkerik.ai',
          tags: 'RAG,Vector DB,WebGPU,Nuxt 3'
        },
        {
          title: 'Cengkerik-Vision: Edge Insect Detection',
          description: 'An IoT vision pipeline optimized for Raspberry Pi and Jetson Nano, leveraging quantized YOLOv8 models to monitor and classify nocturnal insect activities with low latency and power consumption.',
          image_url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
          github_url: 'https://github.com/izzat2kemat/cengkerik-vision',
          demo_url: null,
          tags: 'Computer Vision,YOLOv8,Python,IoT'
        }
      ]

      for (const p of projects) {
        await connection.query(
          'INSERT INTO projects (title, description, image_url, github_url, demo_url, tags) VALUES (?, ?, ?, ?, ?, ?)',
          [p.title, p.description, p.image_url, p.github_url, p.demo_url, p.tags]
        )
      }
      console.log('[Cengkerik DB Init] Seeded projects successfully.')
    }

    // 7. Seed articles if empty
    const [articleRows] = await connection.query('SELECT COUNT(*) as count FROM articles')
    if ((articleRows as any)[0].count === 0) {
      console.log('[Cengkerik DB Init] Seeding "articles" table...')
      const articles = [
        {
          title: 'The Rise of Agentic Coding: Beyond CoPilot',
          summary: 'Explore how software engineering is transforming with autonomous AI agents that don\'t just autocomplete lines, but plan complex tasks, execute commands, run tests, and refactor files.',
          content: 'Artificial Intelligence has rapidly moved from simple syntax helpers to full agentic workflows. In this article, we detail the anatomy of autonomous coding agents, how they decompose tasks, use search tools, and self-heal from terminal errors. We look at the architectural patterns that govern their system interactions and safety guardrails.',
          image_url: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
          read_time: '5 min read',
          category: 'Agentic AI'
        },
        {
          title: 'Fine-Tuning vs RAG: Choosing Your LLM Strategy',
          summary: 'Should you fine-tune a model on your data or feed it dynamically through Retrieval-Augmented Generation? A deep dive into cost, performance, and complexity.',
          content: 'Deciding between Fine-Tuning and Retrieval-Augmented Generation (RAG) is a critical technical choice for modern AI applications. Fine-tuning updates the weights of a model, embedding behavior and tone, whereas RAG dynamically fetches ground-truth context at runtime. We analyze the latency, storage, cost, and reliability metrics of both approaches.',
          image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
          read_time: '8 min read',
          category: 'Architecture'
        },
        {
          title: 'Optimizing Small Language Models for WebGPU',
          summary: 'Running 3B and 7B models inside the user\'s browser is now a reality. Learn how WebGPU and ONNX Runtime enable private, instant AI inference on web apps.',
          content: 'With the arrival of powerful small language models (SLMs) like Phi-3 and Llama-3-8B, client-side inference is taking off. By leveraging WebGPU APIs, web applications can offload computational tasks directly to the user\'s graphic hardware. This guide covers quantization formats, ONNX runtimes, and local memory lifecycle management.',
          image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
          read_time: '6 min read',
          category: 'WebGPU'
        }
      ]

      for (const a of articles) {
        await connection.query(
          'INSERT INTO articles (title, summary, content, image_url, read_time, category) VALUES (?, ?, ?, ?, ?, ?)',
          [a.title, a.summary, a.content, a.image_url, a.read_time, a.category]
        )
      }
      console.log('[Cengkerik DB Init] Seeded articles successfully.')
    }

    console.log('[Cengkerik DB Init] Database initialization completed successfully.')
  } catch (error) {
    console.error('[Cengkerik DB Init] Failed to initialize database:', error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
})
