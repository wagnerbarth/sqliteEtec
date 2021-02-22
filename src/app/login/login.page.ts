import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// custom imports
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private sqlite: SQLite, // inject do SQLite
    private router: Router
  ) { }

  ngOnInit() {
    // ao inicia a aplicação o código é executado

    // cria a base de dados
    this.sqlite.create({
      name: 'cadastro.db', // base de dados
      location: 'default'
    })
      .then(
        // em caso de ok
        (db: SQLiteObject) => {
          // somente pra teste
          // excluir a tabela
          //db.executeSql('drop table cadastro', [])
          //.then(()=>{console.log('Drop OK.')})
          //.catch((err)=>{console.log('Drop erro.' + JSON.stringify(err))});

          db.executeSql( // tabela do banco de dados
            'create table if not exists cadastro(id INTEGER PRIMARY KEY,' +
            'usuario TEXT UNIQUE NOT NULL,' +
            'email TEXT UNIQUE NOT NULL,' +
            'senha TEXT NOT NULL)', []
          )
            .then( // em caso de ok
              () => {
                console.log('Tabela cadastro OK');

                // testar se o usuario admin já esta cadastrado
                const userAdmin = [
                  'admin'
                ];

                db.executeSql('select * from cadastro where usuario = ?', userAdmin)
                  .then(
                    (data) => { // ok no select
                      console.log(data.rows.length);

                      if (data.rows.length < 1) {
                        // inserir dados na tabela
                        // usuario admin e senha padrão de conexão
                        const dadosUsuario = [
                          "admin",
                          "admin@admin.com",
                          "123456"
                        ];

                        db.executeSql(
                          'insert into cadastro ("usuario", "email", "senha") values (?, ?, ?)', dadosUsuario
                        )
                          .then(() => {
                            console.log('Usuário admin OK');
                          })
                          .catch((err: any) => {
                            console.log('Usuário admin Error' + JSON.stringify(err));
                          });
                      } else {
                        console.log('Usuário admin OK');
                      }
                    }
                  )
                  .catch((err) => { // erro no select
                    console.log('Select Error' + JSON.stringify(err));
                  });
              })
            .catch((err: any) => {
              console.log('Erro na criação da tabela cadastro' + JSON.stringify(err));
            });
        })
      .catch((e: any) => {
        console.log('Create Database Error ' + JSON.stringify(e));
      });
  }

  /* método para realizar login
    Este método recebe dois parâmetros, sendo eles:
    - parâmetro 'usuario' do tipo any e será utilizado para receber o usuario digitado 
    pelo cliente;
    - parâmetro 'senha' do tipo any, será utilizado para receber a senha digitada pelo cliente.
  */
  login(usuario: any, senha: any) {

    // testar recebimento dos parâmetros
    console.log('Usuario digitado: ' + usuario + ' Senha digitada: ' + senha);

    // regra de validação de login
    const dadosUsuario = [
      usuario,
      senha
    ];

    // realizar a pesquisa no banco
    this.sqlite.create({
      name: 'cadastro.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        console.log('Abertura da database cadastro no método login - OK');
        // tratar o login
        db.executeSql('SELECT * FROM cadastro WHERE usuario=?  AND senha=?', dadosUsuario)
          .then((data) => {
            console.log('Login ' + data.rows.length);

            if (data.rows.length == 1) {// login ok
              console.log('Login OK!');
              // após realizado o login com sucesso vamos redirecionar a apk para o módulo page crud
              this.router.navigateByUrl('/crud/' + usuario);

            } else {
              console.log('Não foi possível logar, verifique usuário e senha!');
            }
          })
          .catch((err) => {
            console.log('Select error pesquisa de usuario e senha ' + JSON.stringify(err));
          });
      })
      .catch((err) => {
        console.log('Erro no Select Login: ' + JSON.stringify(err));
      });
  }
}
