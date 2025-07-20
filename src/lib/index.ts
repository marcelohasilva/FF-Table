import '../styles/style.css'
import { writable, get } from 'svelte/store';

export type Equipe = { nome: string };
export type Resultado = { equipe: string; kills: number; colocacao: number; pontos: number; queda: number };

// Stores principais
export const equipes = writable<Equipe[]>([]);
export const resultados = writable<Resultado[]>([]);

export const novaEquipe = writable('');
export const totalQuedas = writable(0);

export const equipeSelecionada = writable('');
export const novasKills = writable(0);
export const novaColocacao = writable(1);
export const quedaSelecionada = writable(1);

// Funções utilitárias

export function calcularPontos(colocacao: number, kills: number): number {
  const tabela = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  const pontosColocacao = colocacao >= 1 && colocacao <= 10 ? tabela[colocacao - 1] : 0;
  return pontosColocacao + kills;
}

export function adicionarEquipe(nome: string) {
  nome = nome.trim();
  if (!nome) return;
  if (get(equipes).some(e => e.nome.toLowerCase() === nome.toLowerCase())) {
    alert("Equipe já cadastrada!");
    return;
  }
  equipes.update(list => [...list, { nome }]);
}

export function removerEquipe(index: number) {
  const nomeRemovido = get(equipes)[index].nome;
  equipes.update(list => list.filter((_, i) => i !== index));
  resultados.update(list => list.filter(r => r.equipe !== nomeRemovido));
}

export function adicionarResultado() {
  const equipe = get(equipeSelecionada);
  const quedas = get(totalQuedas);
  const queda = get(quedaSelecionada);
  const colocacao = get(novaColocacao);
  const kills = get(novasKills);

  if (!equipe) return alert("Selecione uma equipe");
  if (quedas === 0) return alert("Defina o total de quedas antes de adicionar resultados.");
  if (queda < 1 || queda > quedas) return alert("Selecione uma queda válida.");

  if (get(resultados).some(r => r.queda === queda && r.equipe === equipe))
    return alert(`Equipe "${equipe}" já tem resultado registrado na Queda ${queda}.`);

  if (get(resultados).some(r => r.queda === queda && r.colocacao === colocacao))
    return alert(`Colocação ${colocacao} já ocupada na Queda ${queda}.`);

  resultados.update(list => [...list, {
    equipe,
    kills,
    colocacao,
    pontos: calcularPontos(colocacao, kills),
    queda
  }]);

  equipeSelecionada.set('');
  novasKills.set(0);
  novaColocacao.set(1);
  quedaSelecionada.set(1);
}

export function removerResultado(index: number) {
  resultados.update(list => list.filter((_, i) => i !== index));
}

export function resetarCampeonato() {
  if (!confirm("Tem certeza que deseja resetar o campeonato? Todos os dados serão apagados.")) return;
  equipes.set([]);
  resultados.set([]);
  novaEquipe.set('');
  equipeSelecionada.set('');
  novasKills.set(0);
  novaColocacao.set(1);
  quedaSelecionada.set(1);
  totalQuedas.set(0);
}

export function getRanking() {
  const list = get(resultados);
  const tabela = list.reduce((acc, r) => {
    if (!acc[r.equipe]) acc[r.equipe] = { equipe: r.equipe, kills: 0, pontos: 0, quedas: 0 };
    acc[r.equipe].kills += r.kills;
    acc[r.equipe].pontos += r.pontos;
    acc[r.equipe].quedas += 1;
    return acc;
  }, {} as Record<string, { equipe: string; kills: number; pontos: number; quedas: number }>);

  return Object.values(tabela).sort((a, b) => b.pontos - a.pontos || b.kills - a.kills);
}

export function getResultadosPorQueda() {
  const list = get(resultados);
  const quedas = get(totalQuedas);
  const resultadosPorQueda: Record<number, typeof list> = {};
  for (let i = 1; i <= quedas; i++) {
    resultadosPorQueda[i] = list.filter(r => r.queda === i).sort((a, b) => a.colocacao - b.colocacao);
  }
  return resultadosPorQueda;
}
