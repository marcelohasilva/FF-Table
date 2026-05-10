<script lang="ts">
  import { onMount } from 'svelte';
  import MatchHistory from '$lib/components/MatchHistory.svelte';
  import OcrUploader from '$lib/components/OcrUploader.svelte';
  import RankingTable from '$lib/components/RankingTable.svelte';
  import ResultForm from '$lib/components/ResultForm.svelte';
  import SquadManager from '$lib/components/SquadManager.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import { championshipApi } from '$lib/services/api/championship';
  import type { Match, OcrSuggestion, RankingEntry, Result, Squad } from '$lib/types';
  import { toLocalDateTimeInput, normalizePlayers } from '$lib/utils/format';
  import { extractSuggestionsFromImage } from '$lib/utils/ocr';

  let squads: Squad[] = [];
  let matches: Match[] = [];
  let results: Result[] = [];
  let ranking: RankingEntry[] = [];

  let loading = true;
  let savingSquad = false;
  let savingResult = false;
  let processingOcr = false;
  let error = '';
  let success = '';

  let squadName = '';
  let squadTag = '';
  let squadPlayers = '';
  let editingSquadId: string | null = null;

  let selectedSquadId = '';
  let kills = 0;
  let placement = 1;
  let matchName = '';
  let startedAt = toLocalDateTimeInput();

  let ocrText = '';
  let ocrSuggestions: OcrSuggestion[] = [];
  let theme: 'dark' | 'light' = 'dark';

  async function loadDashboard() {
    loading = true;
    error = '';

    try {
      [squads, results, ranking, matches] = await Promise.all([
        championshipApi.listSquads(),
        championshipApi.listResults(),
        championshipApi.getRanking(),
        championshipApi.listMatches()
      ]);
    } catch (loadError) {
      error = loadError instanceof Error ? loadError.message : 'Falha ao carregar os dados.';
    } finally {
      loading = false;
    }
  }

  onMount(async () => {
    const savedTheme = localStorage.getItem('ff-table-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      theme = savedTheme;
    }

    await loadDashboard();
  });

  $: if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ff-table-theme', theme);
  }

  function showSuccess(message: string) {
    success = message;
    error = '';
  }

  function showError(message: string) {
    error = message;
    success = '';
  }

  function resetSquadForm() {
    squadName = '';
    squadTag = '';
    squadPlayers = '';
    editingSquadId = null;
  }

  function resetResultForm() {
    selectedSquadId = '';
    kills = 0;
    placement = 1;
    matchName = '';
    startedAt = toLocalDateTimeInput();
  }

  async function submitSquad() {
    savingSquad = true;
    try {
      const payload = {
        name: squadName,
        tag: squadTag,
        players: normalizePlayers(squadPlayers)
      };

      if (editingSquadId) {
        await championshipApi.updateSquad(editingSquadId, payload);
        showSuccess('Squad atualizado com sucesso.');
      } else {
        await championshipApi.createSquad(payload);
        showSuccess('Squad criado com sucesso.');
      }

      resetSquadForm();
      await loadDashboard();
    } catch (submitError) {
      showError(submitError instanceof Error ? submitError.message : 'Erro ao salvar squad.');
    } finally {
      savingSquad = false;
    }
  }

  function editSquad(squad: Squad) {
    squadName = squad.name;
    squadTag = squad.tag;
    squadPlayers = squad.players.join(', ');
    editingSquadId = squad.id;
  }

  async function removeSquad(id: string) {
    if (!confirm('Excluir este squad e todos os resultados associados?')) return;

    try {
      await championshipApi.deleteSquad(id);
      if (editingSquadId === id) {
        resetSquadForm();
      }
      showSuccess('Squad removido.');
      await loadDashboard();
    } catch (removeError) {
      showError(removeError instanceof Error ? removeError.message : 'Erro ao excluir squad.');
    }
  }

  async function submitResult() {
    savingResult = true;
    try {
      await championshipApi.createResult({
        squadId: selectedSquadId,
        kills,
        placement,
        matchName,
        startedAt: new Date(startedAt).toISOString()
      });
      showSuccess('Resultado salvo e ranking atualizado.');
      resetResultForm();
      await loadDashboard();
    } catch (submitError) {
      showError(submitError instanceof Error ? submitError.message : 'Erro ao salvar resultado.');
    } finally {
      savingResult = false;
    }
  }

  async function removeResult(id: string) {
    if (!confirm('Remover este resultado?')) return;

    try {
      await championshipApi.deleteResult(id);
      showSuccess('Resultado removido.');
      await loadDashboard();
    } catch (removeError) {
      showError(removeError instanceof Error ? removeError.message : 'Erro ao excluir resultado.');
    }
  }

  function reuseMatch(match: Match) {
    matchName = match.name;
    startedAt = toLocalDateTimeInput(match.startedAt);
  }

  async function handleOcrUpload(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    processingOcr = true;
    ocrText = '';
    ocrSuggestions = [];

    try {
      const parsed = await extractSuggestionsFromImage(file);
      ocrText = parsed.text;
      ocrSuggestions = parsed.suggestions;
      showSuccess(parsed.suggestions.length ? 'Sugestões OCR carregadas.' : 'OCR concluído. Revise o texto extraído.');
    } catch (ocrError) {
      showError(ocrError instanceof Error ? ocrError.message : 'Falha ao processar a imagem.');
    } finally {
      processingOcr = false;
      input.value = '';
    }
  }

  function applySuggestion(suggestion: OcrSuggestion) {
    const squad = squads.find((item) => item.name.toLowerCase() === suggestion.squadName.toLowerCase());
    if (squad) {
      selectedSquadId = squad.id;
    }
    kills = suggestion.kills;
    if (!matchName) {
      matchName = 'Partida OCR';
    }
  }

  function exportRanking() {
    const header = ['Posição', 'Squad', 'Tag', 'Kills', 'Pontos', 'Partidas'];
    const lines = ranking.map((entry, index) => [
      `${index + 1}`,
      entry.squadName,
      entry.squadTag,
      `${entry.totalKills}`,
      `${entry.totalPoints}`,
      `${entry.matches}`
    ]);

    const csv = [header, ...lines]
      .map((line) => line.map((value) => `"${value.replaceAll('"', '""')}"`).join(';'))
      .join('\n');

    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ranking-ff-table.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
  }

  $: totalKills = ranking.reduce((sum, squad) => sum + squad.totalKills, 0);
  $: totalPoints = ranking.reduce((sum, squad) => sum + squad.totalPoints, 0);
</script>

<svelte:head>
  <title>FF Table | Gerenciador de campeonatos Free Fire</title>
  <meta
    name="description"
    content="Sistema completo para gerenciar squads, resultados, ranking e histórico de campeonatos inspirados em Free Fire."
  />
</svelte:head>

<div class="page-shell">
  <header class="hero panel-full">
    <div>
      <p class="eyebrow">FF Table</p>
      <h1>Gerenciador de campeonatos inspirado em Free Fire</h1>
      <p class="hero-copy">
        Cadastre squads, lance resultados manualmente, acompanhe o ranking em tempo real e use OCR opcional para acelerar a digitação.
      </p>
    </div>

    <div class="hero-actions">
      <ThemeToggle {theme} onToggle={toggleTheme} />
      <div class="stats-grid">
        <article>
          <strong>{squads.length}</strong>
          <span>Squads</span>
        </article>
        <article>
          <strong>{matches.length}</strong>
          <span>Partidas</span>
        </article>
        <article>
          <strong>{totalKills}</strong>
          <span>Kills</span>
        </article>
        <article>
          <strong>{totalPoints}</strong>
          <span>Pontos</span>
        </article>
      </div>
    </div>
  </header>

  {#if loading}
    <section class="panel panel-full loading-state">Carregando campeonato...</section>
  {:else}
    {#if error}
      <section class="feedback error">{error}</section>
    {/if}

    {#if success}
      <section class="feedback success">{success}</section>
    {/if}

    <section class="dashboard-grid">
      <SquadManager
        {squads}
        draftName={squadName}
        draftTag={squadTag}
        draftPlayers={squadPlayers}
        editingId={editingSquadId}
        saving={savingSquad}
        onSubmit={submitSquad}
        onEdit={editSquad}
        onDelete={removeSquad}
        onCancel={resetSquadForm}
      />

      <ResultForm
        {squads}
        {matches}
        recentResults={results.slice(0, 8)}
        {selectedSquadId}
        {kills}
        {placement}
        {matchName}
        {startedAt}
        saving={savingResult}
        onSubmit={submitResult}
        onDelete={removeResult}
        onReuseMatch={reuseMatch}
      />

      <RankingTable {ranking} onExport={exportRanking} />

      <OcrUploader
        suggestions={ocrSuggestions}
        {ocrText}
        processing={processingOcr}
        onFileChange={handleOcrUpload}
        onUseSuggestion={applySuggestion}
      />
    </section>

    <MatchHistory {matches} {results} />
  {/if}
</div>
