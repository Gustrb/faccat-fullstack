const db = require('./config/database');
const bcrypt = require('bcryptjs');

// Dados fake para usuários
const fakeUsers = [
  {
    name: "João Silva",
    email: "joao@email.com",
    password: "123456",
    role: "client"
  },
  {
    name: "Maria Santos",
    email: "maria@email.com", 
    password: "123456",
    role: "client"
  },
  {
    name: "Pedro Costa",
    email: "pedro@email.com",
    password: "123456", 
    role: "client"
  },
  {
    name: "Ana Oliveira",
    email: "ana@email.com",
    password: "123456",
    role: "client"
  },
  {
    name: "Carlos Admin",
    email: "admin@fuckedupcommerce.com",
    password: "admin123",
    role: "admin"
  }
];

// Dados fake para produtos (mais produtos)
const fakeProducts = [
  {
    name: "iPhone 12 Pro Max - Tela Rachada",
    description: "iPhone 12 Pro Max com tela rachada mas funcionando perfeitamente. Apenas a tela tem alguns riscos, mas todas as funcionalidades estão 100% operacionais.",
    price: 2500,
    original_price: 8000,
    condition_description: "Tela com rachaduras, mas touch funcionando. Câmera, bateria e todos os componentes internos perfeitos.",
    image_url: "/uploads/iphone-12-pro-max.jpg",
    stock: 3
  },
  {
    name: "MacBook Pro 2019 - Teclado com Problema",
    description: "MacBook Pro 2019 com teclado que às vezes trava. Excelente para quem usa teclado externo ou não se importa com o problema ocasional.",
    price: 3500,
    original_price: 12000,
    condition_description: "Teclado com falha ocasional, mas tela, processador e demais componentes perfeitos.",
    image_url: "/uploads/macbook-pro-2019.jpg",
    stock: 2
  },
  {
    name: "Samsung Galaxy S21 - Câmera Traseira Quebrada",
    description: "Galaxy S21 com câmera traseira quebrada, mas câmera frontal funcionando. Ideal para quem não usa muito a câmera traseira.",
    price: 1200,
    original_price: 4000,
    condition_description: "Câmera traseira com vidro quebrado, mas câmera frontal e todas as outras funcionalidades perfeitas.",
    image_url: "/uploads/samsung-galaxy-s21.jpg",
    stock: 5
  },
  {
    name: "PlayStation 5 - Controle com Drift",
    description: "PS5 funcionando perfeitamente, mas controle com drift no analógico esquerdo. Console em excelente estado.",
    price: 2800,
    original_price: 5000,
    condition_description: "Console perfeito, apenas controle com drift no analógico. Pode ser usado com controle externo.",
    image_url: "/uploads/playstation-5.jpg",
    stock: 1
  },
  {
    name: "Nintendo Switch - Joy-Con com Problema",
    description: "Nintendo Switch com Joy-Con direito com problema de conectividade. Console funcionando perfeitamente.",
    price: 1500,
    original_price: 3000,
    condition_description: "Console perfeito, Joy-Con direito com problema de conectividade ocasional.",
    image_url: "/uploads/nintendo-switch.jpg",
    stock: 4
  },
  {
    name: "iPad Air 4 - Tela com Risco",
    description: "iPad Air 4 com tela com alguns riscos, mas funcionando perfeitamente. Ideal para uso doméstico.",
    price: 1800,
    original_price: 5000,
    condition_description: "Tela com riscos superficiais, mas touch e todas as funcionalidades perfeitas.",
    image_url: "/uploads/ipad-air-4.jpg",
    stock: 3
  },
  {
    name: "Dell XPS 13 - Bateria com Desgaste",
    description: "Dell XPS 13 com bateria que não dura mais que 3 horas. Laptop funcionando perfeitamente, apenas bateria com desgaste.",
    price: 2200,
    original_price: 8000,
    condition_description: "Bateria com desgaste, mas processador, tela e demais componentes perfeitos.",
    image_url: "/uploads/dell-xps-13.jpg",
    stock: 2
  },
  {
    name: "AirPods Pro - Case com Problema",
    description: "AirPods Pro funcionando perfeitamente, mas case com problema de carregamento. Fones em excelente estado.",
    price: 800,
    original_price: 2000,
    condition_description: "Fones perfeitos, case com problema de carregamento ocasional.",
    image_url: "/uploads/airpods-pro.jpg",
    stock: 6
  },
  {
    name: "Apple Watch Series 6 - Tela com Risco",
    description: "Apple Watch Series 6 com tela com risco, mas todas as funcionalidades funcionando perfeitamente.",
    price: 1200,
    original_price: 3000,
    condition_description: "Tela com risco superficial, mas touch e todas as funcionalidades perfeitas.",
    image_url: "/uploads/apple-watch-6.jpg",
    stock: 3
  },
  {
    name: "Sony WH-1000XM4 - Fone com Problema",
    description: "Sony WH-1000XM4 com fone esquerdo com som baixo, mas cancelamento de ruído funcionando.",
    price: 600,
    original_price: 1500,
    condition_description: "Fone esquerdo com som baixo, mas cancelamento de ruído e demais funcionalidades perfeitas.",
    image_url: "/uploads/sony-wh-1000xm4.jpg",
    stock: 4
  },
  {
    name: "Canon EOS R5 - Sensor com Mancha",
    description: "Canon EOS R5 com sensor com pequena mancha, mas câmera funcionando perfeitamente para a maioria dos usos.",
    price: 8000,
    original_price: 25000,
    condition_description: "Sensor com pequena mancha, mas lente e demais componentes perfeitos.",
    image_url: "/uploads/canon-eos-r5.jpg",
    stock: 1
  },
  {
    name: "Mac Studio M1 - Ventoinha com Ruído",
    description: "Mac Studio M1 com ventoinha fazendo ruído, mas processamento e demais funcionalidades perfeitas.",
    price: 12000,
    original_price: 20000,
    condition_description: "Ventoinha com ruído, mas processamento e demais componentes perfeitos.",
    image_url: "/uploads/mac-studio-m1.jpg",
    stock: 1
  },
  {
    name: "Surface Pro 8 - Teclado com Problema",
    description: "Surface Pro 8 com teclado que às vezes não responde, mas tela e processamento perfeitos.",
    price: 3000,
    original_price: 8000,
    condition_description: "Teclado com problema ocasional, mas tela e processamento perfeitos.",
    image_url: "/uploads/surface-pro-8.jpg",
    stock: 2
  },
  {
    name: "Oculus Quest 2 - Controle com Drift",
    description: "Oculus Quest 2 com controle direito com drift, mas VR funcionando perfeitamente.",
    price: 1500,
    original_price: 3000,
    condition_description: "Controle direito com drift, mas VR e demais funcionalidades perfeitas.",
    image_url: "/uploads/oculus-quest-2.jpg",
    stock: 3
  },
  {
    name: "Tesla Model 3 - Tela com Problema",
    description: "Tesla Model 3 com tela central com problema de toque, mas carro funcionando perfeitamente.",
    price: 150000,
    original_price: 300000,
    condition_description: "Tela central com problema de toque, mas motor e demais sistemas perfeitos.",
    image_url: "/uploads/tesla-model-3.jpg",
    stock: 1
  },
  {
    name: "MacBook Air M1 - Teclado com Problema",
    description: "MacBook Air M1 com teclado que às vezes não responde, mas processamento e tela perfeitos.",
    price: 4000,
    original_price: 10000,
    condition_description: "Teclado com problema ocasional, mas processamento e tela perfeitos.",
    image_url: "/uploads/macbook-air-m1.jpg",
    stock: 2
  },
  {
    name: "iPad Pro 12.9 - Tela com Risco",
    description: "iPad Pro 12.9 com tela com risco, mas todas as funcionalidades funcionando perfeitamente.",
    price: 2500,
    original_price: 8000,
    condition_description: "Tela com risco superficial, mas touch e todas as funcionalidades perfeitas.",
    image_url: "/uploads/ipad-pro-12-9.jpg",
    stock: 1
  },
  {
    name: "Sony A7R IV - Sensor com Mancha",
    description: "Sony A7R IV com sensor com pequena mancha, mas câmera funcionando perfeitamente para a maioria dos usos.",
    price: 12000,
    original_price: 30000,
    condition_description: "Sensor com pequena mancha, mas lente e demais componentes perfeitos.",
    image_url: "/uploads/sony-a7r-iv.jpg",
    stock: 1
  },
  {
    name: "Dell XPS 15 - Bateria com Desgaste",
    description: "Dell XPS 15 com bateria que não dura mais que 2 horas. Laptop funcionando perfeitamente, apenas bateria com desgaste.",
    price: 3500,
    original_price: 12000,
    condition_description: "Bateria com desgaste, mas processador, tela e demais componentes perfeitos.",
    image_url: "/uploads/dell-xps-15.jpg",
    stock: 1
  },
  {
    name: "Surface Laptop 4 - Teclado com Problema",
    description: "Surface Laptop 4 com teclado que às vezes não responde, mas tela e processamento perfeitos.",
    price: 2500,
    original_price: 8000,
    condition_description: "Teclado com problema ocasional, mas tela e processamento perfeitos.",
    image_url: "/uploads/surface-laptop-4.jpg",
    stock: 2
  }
];

// Função para popular o banco
async function seedDatabase() {
  console.log('🌱 Iniciando seed avançado do banco de dados...');
  
  try {
    // Limpar dados existentes
    await new Promise((resolve, reject) => {
      db.getConnection().run('DELETE FROM order_items', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.getConnection().run('DELETE FROM orders', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.getConnection().run('DELETE FROM cart', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.getConnection().run('DELETE FROM products', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    await new Promise((resolve, reject) => {
      db.getConnection().run('DELETE FROM users', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('🗑️ Dados existentes removidos');
    
    // Inserir usuários
    for (const user of fakeUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await new Promise((resolve, reject) => {
        db.getConnection().run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, hashedPassword, user.role],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    console.log(`👥 ${fakeUsers.length} usuários inseridos`);
    
    // Inserir produtos
    for (const product of fakeProducts) {
      await new Promise((resolve, reject) => {
        db.getConnection().run(
          `INSERT INTO products (name, description, price, original_price, condition_description, image_url, stock) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.description,
            product.price,
            product.original_price,
            product.condition_description,
            product.image_url,
            product.stock
          ],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    console.log(`📦 ${fakeProducts.length} produtos inseridos`);
    
    // Criar alguns pedidos fake
    const orders = [
      { user_id: 1, total: 3700, status: 'completed' },
      { user_id: 2, total: 4300, status: 'pending' },
      { user_id: 3, total: 1500, status: 'shipped' },
      { user_id: 4, total: 800, status: 'cancelled' }
    ];
    
    for (const order of orders) {
      const orderId = await new Promise((resolve, reject) => {
        db.getConnection().run(
          'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
          [order.user_id, order.total, order.status],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      
      // Adicionar itens aos pedidos
      const orderItems = [
        { order_id: orderId, product_id: 1, quantity: 1, price: 2500 },
        { order_id: orderId, product_id: 2, quantity: 1, price: 1200 }
      ];
      
      for (const item of orderItems) {
        await new Promise((resolve, reject) => {
          db.getConnection().run(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [item.order_id, item.product_id, item.quantity, item.price],
            function(err) {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }
    
    console.log(`📋 ${orders.length} pedidos criados`);
    
    // Verificar dados inseridos
    const users = await new Promise((resolve, reject) => {
      db.getConnection().all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const products = await new Promise((resolve, reject) => {
      db.getConnection().all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const ordersCount = await new Promise((resolve, reject) => {
      db.getConnection().get('SELECT COUNT(*) as count FROM orders', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    console.log('📊 Resumo do seed:');
    console.log(`👥 Usuários: ${users.length}`);
    console.log(`📦 Produtos: ${products.length}`);
    console.log(`📋 Pedidos: ${ordersCount}`);
    console.log('🎉 Seed avançado concluído com sucesso!');
    
    console.log('\n🔑 Credenciais de acesso:');
    console.log('👤 Admin: admin@fuckedupcommerce.com / admin123');
    console.log('👤 Cliente: joao@email.com / 123456');
    console.log('👤 Cliente: maria@email.com / 123456');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  } finally {
    db.close();
  }
}

// Executar seed
seedDatabase();
