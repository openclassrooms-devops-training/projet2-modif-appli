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
    // Arrange: no token in localStorage (cleared in beforeEach)

    // Act
    cy.visit('/students');

    // Assert
    cy.url().should('include', '/login');
  });

  it('confirms registration and redirects to login', () => {
    // Arrange
    const login = uniqueLogin('register');

    // Act
    cy.visit('/register');
    cy.get('input[formcontrolname="firstName"]').type('Cypress');
    cy.get('input[formcontrolname="lastName"]').type('Tester');
    cy.get('input[formcontrolname="login"]').type(login);
    cy.get('input[formcontrolname="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Assert
    cy.contains('Inscription confirmée').should('be.visible');
    cy.contains('Accéder à la connexion').click();
    cy.url().should('include', '/login');
  });

  it('logs in and redirects to the students page', () => {
    // Arrange
    const login = uniqueLogin('login');
    register(login);

    // Act
    loginThroughUi(login);

    // Assert
    cy.url().should('include', '/students');
    cy.contains('Étudiants abonnés').should('be.visible');
    cy.get('a[href="http://localhost:8080/swagger-ui/index.html"]').should('be.visible');
  });

  it('performs the student CRUD through the UI', () => {
    // Arrange
    const login = uniqueLogin('crud');
    register(login);
    loginThroughUi(login);
    cy.url().should('include', '/students');

    // Act: create a student
    cy.get('input[formcontrolname="firstName"]').type('Alice');
    cy.get('input[formcontrolname="lastName"]').type('Martin');
    cy.get('input[formcontrolname="email"]').type(`${login}@example.com`);
    cy.contains('button', 'Ajouter').click();

    // Assert: the new student appears in the list
    cy.contains('Alice Martin').should('be.visible');

    // Act: update the student's email
    cy.contains('button', 'Modifier').click();
    cy.get('input[formcontrolname="email"]').clear().type(`${login}.updated@example.com`);
    cy.contains('button', 'Enregistrer').click();

    // Assert: the updated email is displayed
    cy.contains(`${login}.updated@example.com`).should('be.visible');

    // Act: delete the student
    cy.on('window:confirm', () => true);
    cy.contains('button', 'Supprimer').click();

    // Assert: the student is gone from the list
    cy.contains(`${login}.updated@example.com`).should('not.exist');
  });
});
