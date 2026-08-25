describe('EtuBibliotheque', () => {
  const password = 'CypressPwd123!';

  function uniqueLogin(prefix: string): string {
    return `${prefix}-${Date.now()}`;
  }

  function register(login: string): void {
    cy.request('POST', `${Cypress.env('apiUrl')}/api/register`, {
      firstName: 'Cypress',
      lastName: 'Tester',
      login,
      password
    }).its('status').should('eq', 201);
  }

  function loginThroughUi(login: string): void {
    cy.visit('/login');
    cy.get('input[formcontrolname="login"]').type(login);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.get('button[type="submit"]').click();
  }

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('redirects unauthenticated users to login', () => {
    cy.visit('/students');
    cy.url().should('include', '/login');
  });

  it('confirms registration and redirects to login', () => {
    const login = uniqueLogin('register');
    cy.visit('/register');
    cy.get('input[formcontrolname="firstName"]').type('Cypress');
    cy.get('input[formcontrolname="lastName"]').type('Tester');
    cy.get('input[formcontrolname="login"]').type(login);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.get('button[type="submit"]').click();

    cy.contains('Inscription confirmée').should('be.visible');
    cy.contains('Accéder à la connexion').click();
    cy.url().should('include', '/login');
  });

  it('logs in and redirects to the students page', () => {
    const login = uniqueLogin('login');
    register(login);
    loginThroughUi(login);

    cy.url().should('include', '/students');
    cy.contains('Étudiants abonnés').should('be.visible');
    cy.get('a[href="http://localhost:8080/swagger-ui/index.html"]').should('be.visible');
  });

  it('performs the student CRUD through the UI', () => {
    const login = uniqueLogin('crud');
    register(login);
    loginThroughUi(login);
    cy.url().should('include', '/students');

    cy.get('input[formcontrolname="firstName"]').type('Alice');
    cy.get('input[formcontrolname="lastName"]').type('Martin');
    cy.get('input[formcontrolname="email"]').type(`${login}@example.com`);
    cy.contains('button', 'Ajouter').click();
    cy.contains('Alice Martin').should('be.visible');

    cy.contains('button', 'Modifier').click();
    cy.get('input[formcontrolname="email"]').clear().type(`${login}.updated@example.com`);
    cy.contains('button', 'Enregistrer').click();
    cy.contains(`${login}.updated@example.com`).should('be.visible');

    cy.on('window:confirm', () => true);
    cy.contains('button', 'Supprimer').click();
    cy.contains(`${login}.updated@example.com`).should('not.exist');
  });
});
