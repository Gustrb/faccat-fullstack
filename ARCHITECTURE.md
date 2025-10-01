# 🏗️ Arquitetura do Projeto

## 📁 Estrutura de Pastas

```
src/
├── config/           # Configurações
│   └── database.js   # Configuração do banco SQLite
├── models/           # Modelos de dados
│   ├── User.js      # Modelo de usuário
│   ├── Product.js    # Modelo de produto
│   ├── Order.js      # Modelo de pedido
│   └── CartItem.js   # Modelo de item do carrinho
├── repositories/     # Camada de acesso a dados
│   ├── UserRepository.js
│   ├── ProductRepository.js
│   ├── OrderRepository.js
│   └── CartRepository.js
├── services/         # Lógica de negócio
│   ├── AuthService.js
│   ├── ProductService.js
│   ├── CartService.js
│   └── OrderService.js
├── controllers/      # Controladores HTTP
│   ├── AuthController.js
│   ├── ProductController.js
│   ├── CartController.js
│   └── OrderController.js
├── middleware/       # Middlewares
│   └── auth.js       # Autenticação e autorização
├── routes/           # Definição de rotas
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   └── orders.js
└── server.js         # Servidor principal
```

## 🎯 Padrões Arquiteturais

### **1. Model-View-Controller (MVC)**
- **Models**: Representam as entidades do domínio
- **Controllers**: Gerenciam requisições HTTP
- **Services**: Contêm a lógica de negócio
- **Repositories**: Abstraem o acesso aos dados

### **2. Separação de Responsabilidades**
- **Config**: Configurações e inicialização
- **Models**: Estrutura de dados e validações
- **Repositories**: Operações de banco de dados
- **Services**: Regras de negócio e orquestração
- **Controllers**: Tratamento de requisições HTTP
- **Routes**: Definição de endpoints
- **Middleware**: Funcionalidades transversais

## 🔄 Fluxo de Dados

```
Request → Routes → Middleware → Controller → Service → Repository → Database
                ↓
Response ← Routes ← Middleware ← Controller ← Service ← Repository ← Database
```

## 📋 Camadas da Aplicação

### **1. Camada de Apresentação (Routes + Controllers)**
- **Responsabilidade**: Tratar requisições HTTP
- **Arquivos**: `routes/`, `controllers/`
- **Função**: Validar entrada, chamar serviços, formatar resposta

### **2. Camada de Negócio (Services)**
- **Responsabilidade**: Implementar regras de negócio
- **Arquivos**: `services/`
- **Função**: Orquestrar operações, aplicar validações, gerenciar transações

### **3. Camada de Dados (Repositories)**
- **Responsabilidade**: Acesso e manipulação de dados
- **Arquivos**: `repositories/`
- **Função**: Abstrair operações de banco, mapear dados

### **4. Camada de Domínio (Models)**
- **Responsabilidade**: Representar entidades do negócio
- **Arquivos**: `models/`
- **Função**: Estruturar dados, aplicar validações

## 🛠️ Benefícios da Arquitetura

### **✅ Manutenibilidade**
- Código organizado e modular
- Fácil localização de funcionalidades
- Separação clara de responsabilidades

### **✅ Testabilidade**
- Cada camada pode ser testada independentemente
- Mocks e stubs facilitados
- Isolamento de dependências

### **✅ Escalabilidade**
- Fácil adição de novas funcionalidades
- Reutilização de componentes
- Flexibilidade para mudanças

### **✅ Legibilidade**
- Estrutura intuitiva e clara
- Código autodocumentado
- Padrões consistentes

## 🚀 Como Usar

### **Desenvolvimento**
```bash
# Usar nova arquitetura
npm run server

# Usar arquitetura antiga (se necessário)
npm run server:old
```

### **Adicionando Nova Funcionalidade**

1. **Model**: Criar em `models/`
2. **Repository**: Implementar em `repositories/`
3. **Service**: Adicionar lógica em `services/`
4. **Controller**: Criar em `controllers/`
5. **Routes**: Definir em `routes/`
6. **Server**: Registrar rotas em `server.js`

## 📊 Comparação: Antes vs Depois

### **❌ Antes (Monolítico)**
- Arquivo único de 600+ linhas
- Lógica misturada
- Difícil manutenção
- Código duplicado
- Testes complexos

### **✅ Depois (Modular)**
- Múltiplos arquivos organizados
- Responsabilidades claras
- Fácil manutenção
- Código reutilizável
- Testes isolados

## 🎉 Resultado

A refatoração transformou um arquivo monolítico em uma arquitetura limpa, organizada e profissional, seguindo as melhores práticas de desenvolvimento de software!

