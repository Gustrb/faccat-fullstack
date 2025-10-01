# 🛒 FuckedUp Commerce

E-commerce para produtos "meio quebrados" com preços imperdíveis!

## 🚀 Funcionalidades

### Para Clientes
- ✅ Cadastro e login de usuários
- ✅ Visualização de produtos com descrições de defeitos
- ✅ Carrinho de compras
- ✅ Finalização de pedidos
- ✅ Histórico de compras

### Para Administradores
- ✅ Gerenciamento completo de produtos (CRUD)
- ✅ Upload de imagens dos produtos
- ✅ Visualização de todos os pedidos
- ✅ Controle de status dos pedidos
- ✅ Filtros por status de pedidos
- ✅ Interface dedicada para gerenciamento de pedidos
- ✅ **Controle de estoque completo**
- ✅ **Edição de estoque em tempo real**
- ✅ **Alertas visuais de estoque baixo**

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- SQLite (banco de dados)
- JWT (autenticação)
- Multer (upload de imagens)
- bcryptjs (criptografia de senhas)

### Frontend
- React + TypeScript
- Tailwind CSS
- React Router
- Axios (requisições HTTP)

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd fuckedupcommerce
```

2. **Instale as dependências**
```bash
npm run install-all
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env na raiz do projeto
JWT_SECRET=sua-chave-secreta-aqui
PORT=5000
```

4. **Inicie o projeto**
```bash
# Inicia backend e frontend simultaneamente
npm run dev

# Ou inicie separadamente:
# Backend: npm run server
# Frontend: cd client && npm start
```

## 🔑 Credenciais de Teste

### Administrador
- **Email:** admin@fuckedupcommerce.com
- **Senha:** admin123

### Cliente
- Crie uma conta através da página de registro

## 📱 Como Usar

### Para Clientes
1. Acesse a página inicial para ver os produtos
2. Clique em um produto para ver detalhes
3. Faça login ou cadastre-se
4. Adicione produtos ao carrinho
5. Finalize sua compra
6. Acompanhe seus pedidos

### Para Administradores
1. Faça login com as credenciais de admin
2. Acesse a área administrativa
3. Adicione, edite ou remova produtos
4. Visualize todos os pedidos
5. Gerencie o status dos pedidos

## 🗂️ Estrutura do Projeto

```
fuckedupcommerce/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── context/       # Context API (autenticação)
│   │   ├── services/      # Serviços de API
│   │   └── types/         # Tipos TypeScript
├── server.js              # Servidor Express
├── database.sqlite        # Banco de dados (criado automaticamente)
├── uploads/               # Imagens dos produtos
└── package.json
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia backend e frontend
- `npm run server` - Inicia apenas o backend
- `npm run client` - Inicia apenas o frontend
- `npm run build` - Build do frontend para produção
- `npm run install-all` - Instala dependências do backend e frontend

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001
- **Uploads:** http://localhost:5001/uploads

## 📋 Funcionalidades Implementadas

### ✅ Sistema de Autenticação
- Registro de usuários
- Login com JWT
- Proteção de rotas
- Diferenciação entre clientes e administradores

### ✅ Gerenciamento de Produtos
- Listagem pública de produtos
- Página individual de cada produto
- CRUD completo para administradores
- Upload de imagens
- Descrição de defeitos/condição

### ✅ Carrinho de Compras
- Adicionar/remover produtos
- Atualizar quantidades
- Cálculo automático do total
- Persistência entre sessões

### ✅ Sistema de Pedidos
- Finalização de compras
- Histórico de pedidos para clientes
- Visualização de todos os pedidos para admins
- Controle de status dos pedidos

### ✅ **Controle de Estoque**
- **Redução automática** do estoque ao finalizar pedidos
- **Validação de estoque** antes de adicionar ao carrinho
- **Interface administrativa** para gerenciar estoque
- **Alertas visuais** para estoque baixo/zerado
- **Prevenção de vendas** sem estoque disponível
- **Remoção automática** de produtos fora de estoque do carrinho
- **Ajuste automático** de quantidades quando estoque insuficiente
- **Restauração automática** do estoque quando pedido cancelado
- **Reativação inteligente** de pedidos com validação de estoque

### ✅ Interface Responsiva
- Design moderno com Tailwind CSS
- Mobile-first approach
- Componentes reutilizáveis
- Navegação intuitiva

### ✅ **Melhorias de UX**
- **Ícone de carrinho** no header (estilo Amazon)
- **Badge com contador** de itens no carrinho
- **Ocultação de preços** quando produto fora de estoque
- **Contexto global** para gerenciamento do carrinho
- **Atualização em tempo real** do contador do carrinho
- **Sistema de notificações** elegante (toast notifications)
- **Remoção automática** de produtos indisponíveis
- **Notificações informativas** sobre mudanças no carrinho

## 🏗️ Arquitetura

O projeto foi refatorado seguindo os princípios de **Clean Architecture** e **MVC**:

### **📁 Estrutura Modular**
```
src/
├── config/           # Configurações (database.js)
├── models/           # Modelos de dados (User, Product, Order, CartItem)
├── repositories/     # Camada de acesso a dados
├── services/         # Lógica de negócio
├── controllers/      # Controladores HTTP
├── middleware/       # Middlewares (auth.js)
├── routes/           # Definição de rotas
└── server.js         # Servidor principal
```

### **🔄 Fluxo de Dados**
```
Request → Routes → Middleware → Controller → Service → Repository → Database
```

### **✅ Benefícios**
- **Manutenibilidade**: Código organizado e modular
- **Testabilidade**: Cada camada testável independentemente
- **Escalabilidade**: Fácil adição de novas funcionalidades
- **Legibilidade**: Estrutura intuitiva e clara

📖 **Documentação completa**: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🚀 Deploy

Para fazer deploy em produção:

1. Configure as variáveis de ambiente
2. Execute `npm run build` para build do frontend
3. Configure um servidor web (nginx, Apache) para servir os arquivos estáticos
4. Configure um processo manager (PM2) para o backend
5. Configure SSL/HTTPS

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
