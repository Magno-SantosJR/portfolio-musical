import { Component, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('portfolio-musical');
  protected readonly formatoAberto = signal<string | null>(null);

  // --- CONTROLE DO SIMULADOR ---
  protected readonly passoAtual = signal<number>(1);
  
  // Respostas básicas
  protected readonly formatoSelecionado = signal<string>(''); // 'voz_e_violao', 'banda_pop_rock_4_integrantes', 'banda_axe'
  protected readonly subFormatoAxe = signal<string>('banda_axe_6_integrantes'); // 'banda_axe_6_integrantes', 'banda_axe_8_integrantes', 'banda_axe_11_integrantes'
  protected readonly tipoEvento = signal<string>(''); // 'bar', 'aniversario', 'corporativo', 'casamento'
  protected readonly duracaoShow = signal<string>(''); // '1h', '2h', '2h30', '3h'
  protected readonly generosSelecionados = signal<string[]>([]);
  
  // Variáveis Específicas de Casamento (Voz & Violão)
  protected readonly casamentoMomento = signal<string>('cerimonia'); // 'cerimonia', 'coquetel_recepcao'
  protected readonly casamentoFormacao = signal<string>('solo_violao'); // 'solo_violao', 'duo'

  // Variáveis de Som / Logística
  protected readonly quantidadePessoas = signal<string>('ate_60_pessoas'); // 'ate_60_pessoas', 'ate_100_pessoas', 'ate_200_pessoas'
  protected readonly tipoAmbiente = signal<string>('fechado'); // 'fechado', 'aberto'
  protected readonly dataEvento = signal<string>(''); // yyyy-mm-dd

  // Dados do Lead
  protected readonly nomeCliente = signal<string>('');
  protected readonly whatsappCliente = signal<string>('');
  protected readonly emailCliente = signal<string>('');
  protected readonly exibirModalSucesso = signal<boolean>(false);

  // TABELA DE PREÇOS OFICIAL MATRIZ
  private readonly precosMatriz: any = {
    "voz_e_violao": {
      "eventos_por_hora": {
        "1h": { "bar": 300, "aniversario": 400, "corporativo": 600 },
        "2h": { "bar": 500, "aniversario": 800, "corporativo": 900 },
        "2h30": { "bar": 600, "aniversario": 900, "corporativo": 1100 },
        "3h": { "bar": 800, "aniversario": 1000, "corporativo": 1300 }
      },
      "casamento": {
        "cerimonia": { "solo_violao": 2000, "duo": 2800 },
        "coquetel_recepcao": { "solo_violao": 3000, "duo": 3800 }
      }
    },
    "banda_pop_rock_4_integrantes": {
      "1h": { "bar": 1200, "aniversario": 1600, "corporativo": 1700, "casamento": 2600 },
      "2h": { "bar": 1600, "aniversario": 2000, "corporativo": 2100, "casamento": 3000 },
      "2h30": { "bar": 1800, "aniversario": 2200, "corporativo": 2300, "casamento": 3400 },
      "3h": { "bar": 2200, "aniversario": 2400, "corporativo": 2500, "casamento": 3800 }
    },
    "banda_axe_6_integrantes": {
      "1h": { "bar": 1700, "aniversario": 2200, "corporativo": 2300, "casamento": 3600 },
      "2h": { "bar": 2850, "aniversario": 2800, "corporativo": 2900, "casamento": 4200 },
      "2h30": { "bar": 3350, "aniversario": 3100, "corporativo": 3200, "casamento": 4800 },
      "3h": { "bar": 3800, "aniversario": 3400, "corporativo": 3500, "casamento": 5400 }
    },
    "banda_axe_8_integrantes": {
      "1h": { "bar": 2200, "aniversario": 2800, "corporativo": 2900, "casamento": 4600 },
      "2h": { "bar": 3250, "aniversario": 3600, "corporativo": 3700, "casamento": 5400 },
      "2h30": { "bar": 3750, "aniversario": 4000, "corporativo": 4100, "casamento": 6200 },
      "3h": { "bar": 4200, "aniversario": 4400, "corporativo": 4500, "casamento": 7000 }
    },
    "banda_axe_11_integrantes": {
      "1h": { "bar": 2950, "aniversario": 3700, "corporativo": 3800, "casamento": 6100 },
      "2h": { "bar": 4400, "aniversario": 4800, "corporativo": 4900, "casamento": 7200 },
      "2h30": { "bar": 5100, "aniversario": 5400, "corporativo": 5500, "casamento": 8300 },
      "3h": { "bar": 5700, "aniversario": 5900, "corporativo": 6000, "casamento": 9400 }
    }
  };

  private readonly precosSom: any = {
    "voz_e_violao": {
      "ate_60_pessoas": { "fechado": 150, "aberto": 200 },
      "ate_100_pessoas": { "fechado": 250, "aberto": 350 },
      "ate_200_pessoas": { "fechado": 400, "aberto": 550 }
    },
    "bandas": {
      "ate_60_pessoas": { "fechado": 600, "aberto": 800 },
      "ate_100_pessoas": { "fechado": 900, "aberto": 1200 },
      "ate_200_pessoas": { "fechado": 1400, "aberto": 1800 }
    }
  };

  // CÁLCULO DO VALOR EM TEMPO REAL
  protected readonly precoCalculado = computed(() => {
    const formato = this.formatoSelecionado();
    const evento = this.tipoEvento();
    const tempo = this.duracaoShow();
    
    if (!formato || !evento) return 0;

    let valorChave = 0;
    const formatoAlvo = formato === 'banda_axe' ? this.subFormatoAxe() : formato;

    // Regra Diferencial: Voz & Violão em Casamento
    if (formato === 'voz_e_violao' && evento === 'casamento') {
      const momento = this.casamentoMomento();
      const formacao = this.casamentoFormacao();
      valorChave = this.precosMatriz[formato]?.casamento?.[momento]?.[formacao] || 0;
    } else {
      // Formatos padrão por hora
      if (!tempo) return 0;
      if (formato === 'voz_e_violao') {
        valorChave = this.precosMatriz[formato]?.eventos_por_hora?.[tempo]?.[evento] || 0;
      } else {
        valorChave = this.precosMatriz[formatoAlvo]?.[tempo]?.[evento] || 0;
      }
    }

    // Regra de Som
    const chaveSom = formato === 'voz_e_violao' ? 'voz_e_violao' : 'bandas';
    const valorSom = this.precosSom[chaveSom]?.[this.quantidadePessoas()]?.[this.tipoAmbiente()] || 0;

    let total = valorChave + valorSom;

    // Regra de Sazonalidade (Multiplicadores)
    const dataStr = this.dataEvento();
    if (dataStr) {
      const dataObj = new Date(dataStr + 'T00:00:00');
      const mes = dataObj.getMonth() + 1; // 12 = Dezembro
      const dia = dataObj.getDate();

      // Natal e Ano Novo (24, 25, 31 de Dezembro e 01 de Janeiro)
      if ((mes === 12 && (dia === 24 || dia === 25 || dia === 31)) || (mes === 1 && dia === 1)) {
        total *= 2.00;
      } else if (mes === 12) {
        // Resto de Dezembro
        total *= 1.50;
      }
    }

    return total;
  });

  protected readonly resumoRepertorio = computed(() => {
    const generos = this.generosSelecionados();
    if (generos.length === 0) return '';
    return generos.length === 1 ? `Focado em ${generos[0]}` : `Mix (${generos.join(', ')})`;
  });

  protected readonly nomeFormatadoFormato = computed(() => {
    const f = this.formatoSelecionado();
    if (f === 'voz_e_violao') return 'Voz & Violão';
    if (f === 'banda_pop_rock_4_integrantes') return 'Pizon & Banda (Pop Rock)';
    if (f === 'banda_axe') {
      if (this.subFormatoAxe() === 'banda_axe_6_integrantes') return 'Banda Axé (6 Integrantes)';
      if (this.subFormatoAxe() === 'banda_axe_8_integrantes') return 'Banda Axé (8 Integrantes)';
      return 'Banda Axé (11 Integrantes)';
    }
    return '';
  });

  // Métodos básicos
  proximoPasso() { if (this.passoAtual() < 5) this.passoAtual.update(p => p + 1); }
  passoAnterior() { if (this.passoAtual() > 1) this.passoAtual.update(p => p - 1); }
  toggleGaveta(formato: string) { this.formatoAberto.set(this.formatoAberto() === formato ? null : formato); }

  selecionarFormatoNoSimulador(formatoId: string) {
    this.formatoAberto.set(null);
    this.formatoSelecionado.set(formatoId);
    this.generosSelecionados.set([]);
    this.passoAtual.set(2);
    document.getElementById('simulador')?.scrollIntoView({ behavior: 'smooth' });
  }

  onGeneroCheckboxChange(label: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.generosSelecionados.update(g => checked ? [...g, label] : g.filter(x => x !== label));
  }

  enviarOrcamento(event: Event) {
    event.preventDefault();
    console.log('Lead Gerado com Valor R$', this.precoCalculado());
    this.exibirModalSucesso.set(true);
  }

  fecharModalSucesso() {
    this.exibirModalSucesso.set(false);
    this.passoAtual.set(1);
  }
}