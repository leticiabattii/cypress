describe('Página de Login - Teste End-to-End', () => {
    beforeEach(() => {
      // Acessa a página de login antes de cada teste
      cy.visit('index.html');
    });
  
    it('Deve exibir mensagem de sucesso ao realizar login com credenciais corretas', () => {
      // Preenche o formulário com credenciais corretas
      cy.get('#username').type('admin');
      cy.get('#password').type('1234');
      
      // Submete o formulário
      cy.get('form').submit();
  
      // Verifica a mensagem de sucesso
      cy.get('#message')
        .should('contain', 'Login bem-sucedido!')
        .and('have.css', 'color', 'rgb(0, 128, 0)'); // Verde em RGB
    });
  
    it('Deve exibir mensagem de erro ao realizar login com credenciais incorretas', () => {
      // Preenche o formulário com credenciais incorretas
      cy.get('#username').type('user');
      cy.get('#password').type('wrongpassword');
      
      // Submete o formulário
      cy.get('form').submit();
  
      // Verifica a mensagem de erro
      cy.get('#message')
        .should('contain', 'Usuário ou senha incorretos.')
        .and('have.css', 'color', 'rgb(255, 0, 0)'); // Vermelho em RGB
    });
  
    it('Deve validar que os campos são obrigatórios', () => {
      // Clica diretamente no botão de login sem preencher o formulário
      cy.get('button').click();
  
      // Verifica se o navegador impede o envio do formulário
      cy.get('#message').should('not.have.text', 'Login bem-sucedido!').and('not.have.text', 'Usuário ou senha incorretos.');
    });
  
    it('Deve verificar se os elementos da página estão visíveis', () => {
      // Verifica a presença de todos os elementos do formulário
      cy.get('h1').contains('Login').should('be.visible');
      cy.get('label[for="username"]').contains('Usuário:').should('be.visible');
      cy.get('#username').should('be.visible');
      cy.get('label[for="password"]').contains('Senha:').should('be.visible');
      cy.get('#password').should('be.visible');
      cy.get('button').contains('Entrar').should('be.visible');
    });
  });
  