// modulos externos

const inquirer = require("inquirer");
const chalk = require("chalk");

// modulos internos
const fs = require("fs");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];
      if (action == "Criar conta") {
        createAccount();
      } else if (action === "Consultar Saldo") {
        getAccountBalance()
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Sacar") {
        withDraw()
      } else if (action === "Sair") {
        console.log(chalk.yellowBright("Obrigado por usar o Accounts!"));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

// crate an account
function createAccount() {
  console.log(chalk.bgBlue.black("Párabens por escolher o nosso banco!"));
  console.log(chalk.blue("defina as opçes da sua conta a seguir"));
  biuldAccount();
}

function biuldAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "digite um nome para sua conta:",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];
      console.info(accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }
      if (fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(
          chalk.bgRed.black("esta conta já existe, escolha outro nome ")
        );
        biuldAccount();
        return;
      }
      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        function (err) {
          console.log(err);
        }
      );
      console.log(chalk.green("Parabens sua conta foi criada!"));
      operation();
    })
    .catch((err) => console.log(err));
}

// add an amount to user account
function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "qual o nome da sua conta?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      // Verify if account exist
      if (!checkAccount(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "quanto deseja depositar?",
          },
        ])
        .then((answer) => {
          const amount = answer['amount']


          //add an amount
          addAmount(accountName, amount)
          operation()

        })
        .catch((err) => console.log(err));
    }).catch(err => console.log(err));
}

function checkAccount(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(chalk.bgWhite.red("esta conta não existe, digite novamente!"));
    return false;
  }
  return true;
}


function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);
  
  if (!amount) {
    console.log(chalk.bgRed.black('ocorreu um erro'))
    return deposit()
  }
   
  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

  fs.writeFileSync(`accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => { console.log(err)}
  )
  console.log(
    chalk.bgGreen.black(`o valor de $${amount}, foi depositado na conta de ${accountName}`)
  )
 
}

function getAccount(accountName) {
  const accountJson = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf-8",
    flag: "r",
  });
  return JSON.parse(accountJson);
}

// show account balance

function getAccountBalance() {
  inquirer.prompt([
    {
      name: 'accountname',
      message: 'qual o nome da sua conta?'
    }
  ]).then((answer) => {
    const accountName = answer['accountname']
    
    if (!checkAccount(accountName)) {
      return getAccountBalance()
    }

    const accountData = getAccount(accountName)

    console.log(
      chalk.bgBlue.black(
        `Olá, o saldo da sua conta é R$${accountData.balance}`
      )
    );
    operation()

  }).catch(err => console.log(err))
}

// withdraw an amount from user account

function withDraw() {
  inquirer.prompt([
    {
      name: 'accountname',
      message: 'qual o nome da sua conta?'
    }
  ]).then((answer) => {
    const accountName = answer['accountname']

    if (!checkAccount(accountName)) { 
    return withDraw()
    }
    
    inquirer.prompt([
      {
        name: 'amount',
        message: 'quanto voce deseja sacar?'
      }
    ]).then((answer) => {
      const amount = answer['amount']

      removeAmount(accountName, amount)
      
    }).catch(err => console.log(err))

  }).catch(err=> console.log(err))
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName)

  if (!amount) {
    console.log(
      chalk.bgRed.black('ocorreu um erron tente novamente!')
    )
    return withDraw()
  }

  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black('valor indisponível'))
    return withDraw()
  }
  
  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
  
  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    (err) => { console.log(err)}
  )
  console.log(chalk.green(`foi realizado um saque de R$${amount} da sua conta
  o saldo atual é de R$${accountData.balance}`));
  operation()
}