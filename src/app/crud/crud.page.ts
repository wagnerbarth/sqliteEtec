import { isNgTemplate } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-crud',
  templateUrl: './crud.page.html',
  styleUrls: ['./crud.page.scss'],
})
export class CrudPage implements OnInit {

  user: any;

  results = new Array(); // declarar um array par a conter os usuários cadastrados

  constructor(
    private activatedroute: ActivatedRoute,
    private sqlite: SQLite,
    private alertcontroller: AlertController
  ) {
    // ajustar atributo usuario com um padrão
    this.user = '...';
  }

  ngOnInit() {

    // recebendo o parâmetro 
    this.user = this.activatedroute.snapshot.paramMap.get('usuario');

    // listar todos ao abrir a aplicação
    this.listarTodos();
  }

  // criar a rotina de cadastro de usuários
  cadastrar(usuario: any, email: any, senha: any) {
    // testar se estamos recebendo os parâmetros
    console.log('usuario = ' + usuario + ', Email = ' + email + ', Senha = ' + senha);

    const userData = [
      usuario,
      email,
      senha
    ];

    this.sqlite.create({
      name: 'cadastro.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {
        // falta validar o cadastro evitando erros no mesmo e alertando usuário do erro
        db.executeSql('INSERT INTO cadastro (usuario, email, senha) VALUES (?,?,?)', userData)
          .then(() => {
            console.log('Usuário cadastrado com sucesso!');
            this.listarTodos();
          })
          .catch((err) => {
            console.log('Usuário não pode ser cadastrado: ' + JSON.stringify(err));
          });
      })
      .catch((err) => {
        console.log('Erro de cadastro de usuário ' + JSON.stringify(err));
      });
  }

  /* -----------------------------------------------------------------
    Listar todos os usuários sempre que um novo usuário for cadastrado
  -------------------------------------------------------------------*/
  listarTodos() {

    this.results = []; // limpando o array de usuarios

    this.sqlite.create({
      name: 'cadastro.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => { // em casoa de ok
        // pesquisar usuários no banco tabela cadastro
        db.executeSql('SELECT * FROM cadastro', [])
          .then((data) => { // em caso de ok

            for (let i = 0; i < data.rows.length; i++) {

              let item = data.rows.item(i);
              console.log(JSON.stringify(item)); // resultado de item

              if (this.user == 'admin') { // usuário = admin lista todos
                this.results.push(item);
              } else if (this.user === item.usuario) { // somente o usuário
                this.results.push(item); 
              }
              
            }

          })
          .catch((err) => {
            console.log('Erro de pesquisa de usuário em Listar Todos: ' + JSON.stringify(err));
          });
      })
      .catch((err) => {
        console.log('Erro ao abrir banco de dados cadastro em Listar Todos:' + JSON.stringify(err));
      });
  }

  /*---------------------------
    método para excluir usuário
  -----------------------------*/
  excluirUsuario(id: any) {
    console.log(id); // verifica se id foi recebido

    const idUsuario = [
      id
    ];

    // criar exclusão
    this.sqlite.create({
      name: "cadastro.db",
      location: "default"
    })
      .then((db: SQLiteObject) => { // em caso de ok
        // testar se o usuário é admin e não permitir excluir
        if (id !== 1) {
          db.executeSql('DELETE FROM cadastro WHERE id=?', idUsuario)
            .then(() => { // em caso de ok
              console.log('Usuário excluido com sucesso.');
              this.listarTodos();
            })
            .catch((err) => {
              console.log('Erro ao excluir usuário: ' + JSON.stringify(err));
            });
        } else {
          console.log('Usuário Admin não pode ser excluido!');
        }
      })
      .catch((err) => {
        console.log('Erro ao abrir database em excluir usuario: ' + JSON.stringify(err));
      });
  }

  /*-----------------------
  Atualizar campos da tabela
  ------------------------*/

  // método para mostrar prompt ao usuário
  async atualizar(campo: any, data: any, id: any) {

    console.log(campo, data, id);

    const alert = await this.alertcontroller.create({
      header: 'Atualizar',
      message: 'Digite o dado a ser alterado no campo: ' + '"' + campo + '"',
      inputs: [
        {
          name: 'data',
          type: 'text',
          placeholder: data
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel', // manter a regra
          handler: () => { // quem executa
            console.log('Ação cancelada pelo usuário.');
          }
        },
        {
          text: 'Atualizar',
          handler: (result) => { // é aqui que o método atualizarTabela será chamado
            console.log('dado a ser atualizado: ' + result.data);
            this.atualizarTabela(campo, result.data, id);
          }
        }
      ]
    });
    await alert.present();
  }

  // método para atualizar o campo na tabela
  atualizarTabela(campo: any, data: any, id: any) {

    this.sqlite.create({
      name: 'cadastro.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => { // em caso de ok

        console.log('SQL = ' + 'UPDATE cadastro SET ' + campo + '="' + data + '" WHERE id="' + id + '"');
        db.executeSql('UPDATE cadastro SET ' + campo + '="' + data + '" WHERE id="' + id + '"', [])
          .then(() => {
            console.log('Dado atualizado com sucesso. ');
            this.listarTodos(); // atualiza a tabela
          })
          .catch((err) => {
            console.log('Erro ao atualizar tabela: ' + JSON.stringify(err));
          });

      })
      .catch((err) => {
        console.log('Erro ao abrir database em atualizar tabela: ' + JSON.stringify(err));
      });

  }


}
