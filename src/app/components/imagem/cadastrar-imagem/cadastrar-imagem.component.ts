import { Component, OnInit, EventEmitter, Output, Input, OnDestroy } from '@angular/core';
import { ObjetoErro } from 'src/app/utils/tratamento_erro/ObjetoErro';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { IObjetoSessaoModel } from 'src/app/models/autenticacao/objeto_sessao.model';
import { ArmazenamentoBrowser } from 'src/app/utils/browser_storage/browser_storage';
import { ChavesArmazenamentoBrowser } from 'src/app/utils/chaves_armazenamento_browser';
import { ImagemService } from 'src/app/services/imagens_service/imagens.service';
import { HttpStatusCode } from 'src/app/utils/tratamento_erro/Http_Status_Code';
import { Subscription } from 'rxjs';
import { ILesaoModelResultado } from 'src/app/models/imagem/lesao.model';

@Component({
    selector: 'cr-cadastrar-imagem',
    templateUrl: './cadastrar-imagem.component.html',
    styleUrls: ['./cadastrar-imagem.component.css']
})

export class CadastrarImagemComponent implements OnInit, OnDestroy {

    //#region Propriedades
    private objetoErro: ObjetoErro;
    private objetoSessao: IObjetoSessaoModel;
    private armazenamentoBrouser: ArmazenamentoBrowser;
    public todasLesoes: ILesaoModelResultado[];
    public formularioImagem: FormGroup;
    public arquivoSelecionado: boolean;
    private solicitarCadastroImagemSubscription: Subscription;
    private listarTodasLesoesSubscription: Subscription;
    
    @Output() public novaImagemCadastradaEventEmiter = new EventEmitter<boolean>();
    //#endregion

    constructor(private imagemService: ImagemService, private formBuilder: FormBuilder) {

        this.armazenamentoBrouser = new ArmazenamentoBrowser();
        this.objetoSessao = JSON.parse(this.armazenamentoBrouser.obterDadoSessao(ChavesArmazenamentoBrowser.CHAVE_USUARIO_LOGADO));
        this.objetoErro = new ObjetoErro();
        this.arquivoSelecionado = false;

        this.formularioImagem = this.formBuilder.group({
            codigo_lamina:
                [
                    '',
                    Validators.compose([
                        Validators.required,
                        Validators.minLength(3),
                        Validators.maxLength(60)
                    ])
                ],
            dt_aquisicao:
                [
                    '',
                    Validators.compose([
                        Validators.required
                    ])
                ],
            lesao_imagem:
                [
                    '',
                    Validators.compose([
                        Validators.required
                    ])
                ],
            arquivo_imagem: [null]
        });
    }

    ngOnInit() {
        this.listarTodasLesoes()
    }

    ngOnDestroy() {
        if(this.solicitarCadastroImagemSubscription) {this.solicitarCadastroImagemSubscription.unsubscribe()}
        if(this.listarTodasLesoesSubscription) {this.listarTodasLesoesSubscription.unsubscribe()}
    }

    //#region Metodos
    solicitarCadastroImagem() {

        if (this.formularioImagem.valid) {

            this.novaImagemCadastradaEventEmiter.emit(true);
            let formularioFormData: FormData = new FormData();
            formularioFormData.append('id_usuario', this.objetoSessao.id_usuario.toString());
            formularioFormData.append('codigo_lamina', this.formularioImagem.get('codigo_lamina').value);
            formularioFormData.append('dt_aquisicao', this.formularioImagem.get('dt_aquisicao').value);
            formularioFormData.append('id_lesao', this.formularioImagem.get('lesao_imagem').value);
            formularioFormData.append('file', this.formularioImagem.get('arquivo_imagem').value);

            this.solicitarCadastroImagemSubscription =
            this.imagemService.cadastrarImagem(formularioFormData)
            .subscribe(
                (retorno) => {
                    alert('Image successfully registered');
                    this.novaImagemCadastradaEventEmiter.emit(false);
                },
                (erro) => {

                    this.novaImagemCadastradaEventEmiter.emit(false);
                    this.objetoErro = erro.error;                    
                    switch(this.objetoErro.status_code) {

                        case HttpStatusCode.UNAUTHORIZED: {
                            alert(this.objetoErro.mensagem);
                            break;
                        }

                        case HttpStatusCode.BAD_REQUEST: {
                            alert(this.objetoErro.mensagem);
                            break;
                        }

                        case HttpStatusCode.NOT_FOUND: {
                            alert(this.objetoErro.mensagem);
                            break;
                        }

                        case HttpStatusCode.FORBIDDEN: {
                            alert(this.objetoErro.mensagem);
                            break;
                        }

                        case HttpStatusCode.INTERNAL_SERVER_ERROR: {
                            alert(this.objetoErro.mensagem);
                            break;
                        }

                        default: {
                            alert(erro);
                            break;
                        }
                    }
                }
            );
        }
        else {
            alert('Could not retrieve informations from form. Plase, try again.');
        }
    }

    tratarUpload(event: any) {

        const arquivo = (event.target as HTMLInputElement).files[0];
        this.formularioImagem.patchValue({
            arquivo_imagem: arquivo
        });
        this.formularioImagem.get('arquivo_imagem').updateValueAndValidity();
        this.arquivoSelecionado = true;
    }

    listarTodasLesoes() {

        this.listarTodasLesoesSubscription =
        this.imagemService.listarLesoes()
        .subscribe(
            (retorno) => {
                this.todasLesoes = retorno;
            },
            (erro) => {

                this.objetoErro = erro.error;
                switch(this.objetoErro.status_code) {

                    case HttpStatusCode.UNAUTHORIZED: {
                        alert(this.objetoErro.mensagem);
                        break;
                    }

                    case HttpStatusCode.NOT_FOUND: {
                        alert(this.objetoErro.mensagem);
                        break;
                    }

                    case HttpStatusCode.INTERNAL_SERVER_ERROR: {
                        alert(this.objetoErro.mensagem);
                        break;
                    }

                    default: {
                        alert(erro);
                        break;
                    }
                }
            }
        );
    }

    // Propriedades do formulário que vamos utilizar para obter os erros
    get codigo_lamina() {
        return this.formularioImagem.get('codigo_lamina');
    }

    get dt_aquisicao() {
        return this.formularioImagem.get('dt_aquisicao');
    }

    get lesao_imagem() {
        return this.formularioImagem.get('lesao_imagem');
    }
    //#endregion
}
