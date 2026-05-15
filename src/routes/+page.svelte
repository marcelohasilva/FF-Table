<script lang="ts">
  import {
    teams,
    results,
    newTeamName,
    totalDrops,
    selectedTeamId,
    newKills,
    newPosition,
    selectedDrop,
    addTeam,
    removeTeam,
    addMatchFromForm,
    addMatchResults,
    resetTournament,
    getRanking,
    getResultsByDrop
  } from '../lib/index';

  import { derived, writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import Sidebar from '../lib/components/Sidebar.svelte';
  import Header from '../lib/components/Header.svelte';
  import StatCard from '../lib/components/StatCard.svelte';
  import RankingTable from '../lib/components/RankingTable.svelte';
  import MatchCard from '../lib/components/MatchCard.svelte';
  import HighlightCard from '../lib/components/HighlightCard.svelte';
  import Card from '../lib/components/Card.svelte';

  const ranking = derived(results, () => getRanking());
  const resultadosPorQueda = derived([results, totalDrops], () => getResultsByDrop());

  const quedasConcluidas = derived(results, ($resultados) => new Set($resultados.map((r) => r.drop)).size);
  const totalKills = derived(results, ($resultados) => $resultados.reduce((acc, r) => acc + r.kills, 0));
  const totalVitorias = derived(results, ($resultados) => $resultados.filter((r) => r.position === 1).length);
  const totalTimes = derived(teams, ($teams) => $teams.length);

  const ultimaQueda = derived(results, ($resultados) =>
    $resultados.length ? Math.max(...$resultados.map((r) => r.drop)) : 0
  );
  const resultadosUltimaQueda = derived([resultadosPorQueda, ultimaQueda], ([$resultadosPorQueda, $ultimaQueda]) =>
    $ultimaQueda ? $resultadosPorQueda[$ultimaQueda] ?? [] : []
  );

  const showSkeleton = derived([teams, results], ([$teams, $resultados]) =>
    $teams.length === 0 && $resultados.length === 0
  );
  const showEmpty = derived([results, totalDrops], ([$resultados, $totalDrops]) =>
    $totalDrops > 0 && $resultados.length === 0
  );
  const errorMessage = derived([totalDrops, teams], ([$totalDrops, $teams]) =>
    $totalDrops > 0 && $teams.length === 0
      ? 'Cadastre equipes antes de inserir resultados.'
      : ''
  );

  const highlightKills = derived(ranking, ($ranking) => $ranking.length ? Math.max(...$ranking.map((r) => r.kills)) : 0);
  const highlightBooyah = derived(ranking, ($ranking) => $ranking.length ? Math.max(...$ranking.map((r) => r.booyah)) : 0);
  const highlightMedia = derived(ranking, ($ranking) =>
    $ranking.length
      ? Math.max(...$ranking.map((r) => (r.matches ? r.points / r.matches : 0))).toFixed(2)
      : '0.00'
  );
  const highlightKillsTeam = derived(ranking, ($ranking) => {
    if (!$ranking.length) return '-';
    return [...$ranking].sort((a, b) => b.kills - a.kills)[0]?.name ?? '-';
  });
  const highlightBooyahTeam = derived(ranking, ($ranking) => {
    if (!$ranking.length) return '-';
    return [...$ranking].sort((a, b) => b.booyah - a.booyah)[0]?.name ?? '-';
  });
  const highlightAverageTeam = derived(ranking, ($ranking) => {
    if (!$ranking.length) return '-';
    return [...$ranking].sort((a, b) => b.average - a.average)[0]?.name ?? '-';
  });

  let sidebarOpen = false;
  const toggleSidebar = () => {
    sidebarOpen = !sidebarOpen;
  };
  const closeSidebar = () => {
    sidebarOpen = false;
  };

  let liveSeconds = 0;
  let liveTimeLabel = '00:00';
  let selectedDropTab = 0;
  let resultadosSelecionados: Array<{ drop: number }> = [];
  const liveMap = 'Bermuda';
  const liveDropOverride = writable<number | null>(null);
  const liveDrop = derived([results, totalDrops, teams, liveDropOverride], ([$results, $totalDrops, $teams, $override]) => {
    if ($totalDrops === 0) return 1;
    if ($override !== null) return Math.min($override, $totalDrops);
    for (let i = 1; i <= $totalDrops; i++) {
      const filled = $teams.filter((team) => team.matches[i - 1]).length;
      if (filled < $teams.length) return i;
    }
    return $totalDrops;
  });

  const nextDrop = derived([liveDrop, totalDrops], ([$liveDrop, $totalDrops]) => {
    if ($totalDrops === 0) return 1;
    return Math.min($liveDrop + 1, $totalDrops);
  });

  const mapPool = ['Bermuda', 'Purgatorio', 'Alpine', 'Kalahari', 'Nova Terra'];
  const baseHour = 20;
  const baseMinute = 30;

  function getDropMeta(drop: number) {
    const minuteOffset = (drop - 1) * 40;
    const hour = baseHour + Math.floor((baseMinute + minuteOffset) / 60);
    const minute = (baseMinute + minuteOffset) % 60;
    return {
      map: mapPool[(drop - 1) % mapPool.length],
      time: `25/05/2026 - ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    };
  }

  const nextMatch = derived([nextDrop, totalDrops], ([$nextDrop, $totalDrops]) => {
    if ($totalDrops === 0) return { drop: 1, map: '-', time: '-' };
    const meta = getDropMeta($nextDrop);
    return { drop: $nextDrop, map: meta.map, time: meta.time };
  });

  const matchSchedule = derived([totalDrops, liveDrop, teams], ([$totalDrops, $liveDrop, $teams]) => {
    const total = $totalDrops || 0;

    return Array.from({ length: total }, (_, index) => {
      const drop = index + 1;
      const meta = getDropMeta(drop);

      return {
        drop,
        title: `Queda ${drop}`,
        map: meta.map,
        time: meta.time,
        status: drop === $liveDrop ? 'AO VIVO' : '',
        teams: $teams.map((team) => team.name)
      };
    });
  });

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  $: liveTimeLabel = formatTime(liveSeconds);
  $: if (selectedDropTab === 0) {
    selectedDropTab = $ultimaQueda || $liveDrop || 1;
  }
  $: resultadosSelecionados = $resultadosPorQueda[selectedDropTab] ?? [];

  function viewDrop(drop: number) {
    selectedDropTab = drop;
    const target = document.getElementById('latest-drops');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function endCurrentDrop() {
    const current = $liveDrop;
    const max = $totalDrops || 0;
    if (max === 0) return;
    const next = Math.min(current + 1, max);
    liveDropOverride.set(next);
    liveSeconds = 0;
  }

  let ocrApiKey = '';
  let ocrFiles: File[] = [];
  let ocrStatus = '';
  let ocrRawText = '';
  let ocrDrop = 1;
  let ocrRows: Array<{ position: number; teamId: string; teamName: string; kills: number }> = [];

  function normalizeName(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]/g, '');
  }

  function findTeamIdByName(name: string) {
    const teamsList = $teams;
    const normalized = normalizeName(name);
    const exact = teamsList.find((team) => normalizeName(team.name) === normalized);
    if (exact) return exact.id;
    const partial = teamsList.find((team) => normalized.includes(normalizeName(team.name)) || normalizeName(team.name).includes(normalized));
    return partial?.id ?? '';
  }

  function parseOcrText(text: string) {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const rows: Array<{ position: number; teamId: string; teamName: string; kills: number }> = [];
    for (const line of lines) {
      const match = line.match(/^(\d{1,2})\s+(.+?)\s+(\d{1,2})$/);
      if (!match) continue;
      const position = Number(match[1]);
      const kills = Number(match[3]);
      if (!Number.isFinite(position) || position < 1 || position > 12) continue;
      if (!Number.isFinite(kills)) continue;
      const teamName = match[2].trim();
      rows.push({
        position,
        kills,
        teamName,
        teamId: findTeamIdByName(teamName)
      });
    }

    const unique = new Map<number, { position: number; teamId: string; teamName: string; kills: number }>();
    for (const row of rows) {
      if (!unique.has(row.position)) unique.set(row.position, row);
    }

    return Array.from(unique.values()).sort((a, b) => a.position - b.position);
  }

  async function runOcr() {
    if (!ocrApiKey.trim()) {
      ocrStatus = 'Informe a API key do OCR.Space.';
      return;
    }
    if (ocrFiles.length < 1) {
      ocrStatus = 'Envie pelo menos 1 print.';
      return;
    }

    ocrStatus = 'Processando OCR...';
    ocrRawText = '';
    ocrRows = [];

    try {
      const texts: string[] = [];
      for (const file of ocrFiles.slice(0, 4)) {
        const form = new FormData();
        form.append('apikey', ocrApiKey.trim());
        form.append('language', 'por');
        form.append('isOverlayRequired', 'false');
        form.append('file', file);

        const response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          body: form
        });
        const data = await response.json();
        const parsed = data?.ParsedResults?.[0]?.ParsedText ?? '';
        texts.push(parsed);
      }

      ocrRawText = texts.join('\n');
      ocrRows = parseOcrText(ocrRawText);
      ocrStatus = ocrRows.length ? 'Revisar resultados antes de confirmar.' : 'Nao foi possivel ler os resultados.';
    } catch (error) {
      ocrStatus = 'Falha ao processar OCR. Verifique a API key e tente novamente.';
    }
  }

  function updateOcrRow(index: number, patch: Partial<{ teamId: string; kills: number }>) {
    ocrRows = ocrRows.map((row, i) => (i === index ? { ...row, ...patch } : row));
  }

  function applyOcrResults() {
    if (ocrRows.length === 0) return;
    const total = $totalDrops || 0;
    if (total === 0) {
      ocrStatus = 'Defina o total de quedas antes de aplicar.';
      return;
    }
    if (ocrDrop < 1 || ocrDrop > total) {
      ocrStatus = 'Selecione uma queda valida.';
      return;
    }

    const invalid = ocrRows.find((row) => !row.teamId || !Number.isFinite(row.kills));
    if (invalid) {
      ocrStatus = 'Revise os times e kills antes de confirmar.';
      return;
    }

    addMatchResults(
      ocrRows.map((row) => ({
        teamId: row.teamId,
        position: row.position,
        kills: row.kills,
        drop: ocrDrop
      }))
    );
    ocrStatus = 'Resultados aplicados com sucesso.';
  }

  onMount(() => {
    const timerId = setInterval(() => {
      liveSeconds += 1;
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  });
</script>

<div class={`app ${sidebarOpen ? 'sidebar-open' : ''}`}>
  <Sidebar
    on:close={closeSidebar}
    on:endDrop={endCurrentDrop}
    liveDrop={$liveDrop}
    totalDrops={$totalDrops || 0}
    liveMap={liveMap}
    liveTimeLabel={liveTimeLabel}
  />

  <div class="main">
    <section class="hero">
      <Header title="Campeonato X" subtitle="Squad - 12 equipes - 6 quedas" live={true} on:toggle={toggleSidebar} />

      <div class="stats-grid">
        <StatCard label="Quedas" value={`${$quedasConcluidas}/${$totalDrops || 0}`} meta="Concluidas" accent="purple">
          <svelte:fragment slot="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" /></svg>
          </svelte:fragment>
        </StatCard>
        <StatCard label="Times" value={`${$totalTimes}`} meta="Participantes" accent="blue">
          <svelte:fragment slot="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7a4 4 0 1 0 0.001-0.001L7 7zm10 0a4 4 0 1 0 0.001-0.001L17 7zM4 19a5 5 0 0 1 10 0v1H4v-1zm10.5 1a6.5 6.5 0 0 1 5.5-6.4 5 5 0 0 1 4 4.9V20h-9.5z" /></svg>
          </svelte:fragment>
        </StatCard>
        <StatCard label="Vitorias" value={`${$totalVitorias}`} meta="Lider isolado" accent="pink">
          <svelte:fragment slot="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v3a4 4 0 0 1-8 0V4zm-4 0h4v3a6 6 0 0 0 12 0V4h4v5a6 6 0 0 1-6 6h-1v3h2v3H7v-3h2v-3H8a6 6 0 0 1-6-6V4z" /></svg>
          </svelte:fragment>
        </StatCard>
        <StatCard label="Kills totais" value={`${$totalKills}`} meta="Nesta edicao" accent="teal">
          <svelte:fragment slot="icon">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4l6 6-2 2-6-6V4h2zm10 10l6 6h-2l-6-6 2-2zm-2-8l2 2-6 6-2-2 6-6zm-4 10l2 2-6 6H3l6-6z" /></svg>
          </svelte:fragment>
        </StatCard>
      </div>
    </section>

    <section class="content-grid">
      <div class="col col-primary">
        <Card title="Ranking Geral" subtitle="Resumo oficial do campeonato" actionLabel="Ver todas">
          {#if $showSkeleton}
            <div class="skeleton-table">
              <div class="skeleton-row"></div>
              <div class="skeleton-row"></div>
              <div class="skeleton-row"></div>
              <div class="skeleton-row"></div>
            </div>
          {:else if $errorMessage}
            <div class="state state-error">{$errorMessage}</div>
          {:else if $ranking.length === 0}
            <div class="state">Nenhum resultado para gerar ranking.</div>
          {:else}
            <RankingTable rows={$ranking} />
            <div class="ranking-legend">
              <span class="legend-item"><span class="legend-pill">P</span> Pontuacao</span>
              <span class="legend-item">1 kill = 1 ponto</span>
              <span class="legend-item">Booyah = 12 pontos</span>
              <span class="legend-item">Posicao = Pontuacao variavel</span>
            </div>
          {/if}
        </Card>

        <Card title="Partidas" subtitle="Calendario oficial">
          {#if $showSkeleton}
            <div class="skeleton-list">
              <div class="skeleton-card"></div>
              <div class="skeleton-card"></div>
            </div>
          {:else}
            <div class="match-list">
              {#each $matchSchedule as match}
                <MatchCard
                  drop={match.drop}
                  title={match.title}
                  map={match.map}
                  time={match.time}
                  status={match.status}
                  teams={match.teams}
                  on:view={(event) => viewDrop(event.detail.drop)}
                />
              {/each}
            </div>
          {/if}
        </Card>
      </div>

      <div class="col col-secondary">
        <Card title="Ultimas quedas" subtitle="Resultados por rodada" actionLabel="Ver todas">
          <div class="tab-row" id="latest-drops">
            <button class={`tab ${selectedDropTab === $ultimaQueda ? 'active' : ''}`} on:click={() => viewDrop($ultimaQueda || 1)}>
              Queda {$ultimaQueda || '-'}
            </button>
            <button class={`tab ${selectedDropTab === ($ultimaQueda > 1 ? $ultimaQueda - 1 : 2) ? 'active' : ''}`} on:click={() => viewDrop($ultimaQueda > 1 ? $ultimaQueda - 1 : 2)}>
              Queda {$ultimaQueda > 1 ? $ultimaQueda - 1 : 2}
            </button>
            <button class={`tab ${selectedDropTab === ($ultimaQueda > 2 ? $ultimaQueda - 2 : 1) ? 'active' : ''}`} on:click={() => viewDrop($ultimaQueda > 2 ? $ultimaQueda - 2 : 1)}>
              Queda {$ultimaQueda > 2 ? $ultimaQueda - 2 : 1}
            </button>
          </div>
          <div class="mini-table">
            <div class="mini-header">
              <div>Pos</div>
              <div>Time</div>
              <div>Booyah</div>
              <div>Pts</div>
              <div>Kills</div>
            </div>
            {#if $totalDrops === 0}
              <div class="state">Defina o total de quedas para exibir resultados.</div>
            {:else if $showEmpty}
              <div class="state">Nenhum resultado para esta queda.</div>
            {:else}
              {#each resultadosSelecionados as res}
                <div class="mini-row">
                  <div class="mini-pos">#{res.position}</div>
                  <div class="mini-team">
                    <span class="team-logo">{res.teamName.slice(0, 2).toUpperCase()}</span>
                    {res.teamName}
                  </div>
                  <div class={`mini-booyah ${res.position === 1 ? 'active' : ''}`}>
                    {res.position === 1 ? 'BOOYAH!' : '-'}
                  </div>
                  <div class="mini-pts">{res.points}</div>
                  <div class="mini-kills">{res.kills}</div>
                </div>
              {/each}
            {/if}
          </div>
        </Card>

        <Card title="Destaques do campeonato" subtitle="Os melhores da noite">
          <div class="highlight-grid">
            <HighlightCard label="Mais kills" value={`${$highlightKills}`} caption={$highlightKillsTeam} accent="purple">
              <svelte:fragment slot="icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6l2 2h8v6l-2 2v8H4V4zm5 4h6v2H9V8zm0 4h6v2H9v-2z" /></svg>
              </svelte:fragment>
            </HighlightCard>
            <HighlightCard label="Mais Booyah" value={`${$highlightBooyah}`} caption={$highlightBooyahTeam} accent="gold">
              <svelte:fragment slot="icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v3a4 4 0 0 1-8 0V4zm-4 0h4v3a6 6 0 0 0 12 0V4h4v5a6 6 0 0 1-6 6h-1v3h2v3H7v-3h2v-3H8a6 6 0 0 1-6-6V4z" /></svg>
              </svelte:fragment>
            </HighlightCard>
            <HighlightCard label="Melhor media" value={`${$highlightMedia}`} caption={$highlightAverageTeam} accent="blue">
              <svelte:fragment slot="icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16v2H4v-2zm2-6h3v6H6v-6zm5-4h3v10h-3V9zm5 2h3v8h-3v-8z" /></svg>
              </svelte:fragment>
            </HighlightCard>
          </div>
        </Card>

        <Card title="Proxima queda" subtitle="Agenda confirmada">
          <div class="next-match">
            <div class="next-title">Queda {$nextMatch.drop}</div>
            <div class="next-map">{$nextMatch.map}</div>
            <div class="next-meta">{$nextMatch.time}</div>
            <button class="btn btn-ghost btn-small">Ver detalhes</button>
          </div>
        </Card>

        <Card title="Central de controle" subtitle="Gerencie dados rapidos">
          <div class="form-grid">
            <form class="form-card" on:submit|preventDefault={() => { addTeam($newTeamName); newTeamName.set(''); }}>
              <div class="form-title">Cadastro de equipes</div>
              <label>
                Nome da equipe
                <input type="text" bind:value={$newTeamName} placeholder="Digite o nome" required autocomplete="off" />
              </label>
              <button type="submit" class="btn btn-primary" disabled={!$newTeamName.trim()}>
                Adicionar equipe
              </button>
              {#if $teams.length > 0}
                <div class="chip-list">
                  {#each $teams as equipe, i}
                    <span class="chip">
                      {equipe.name}
                      <button type="button" on:click={() => removeTeam(i)}>x</button>
                    </span>
                  {/each}
                </div>
              {/if}
            </form>

            <form class="form-card" on:submit|preventDefault={addMatchFromForm}>
              <div class="form-title">Adicionar resultado</div>
              <label>
                Total de quedas
                <input type="number" min="1" bind:value={$totalDrops} placeholder="Ex: 12" required />
              </label>
              <label>
                Queda
                <input
                  type="number"
                  min="1"
                  max={$totalDrops}
                  bind:value={$selectedDrop}
                  required
                  placeholder={`1 a ${$totalDrops || '?'}`}
                />
              </label>
              <label>
                Equipe
                <select bind:value={$selectedTeamId} required>
                  <option value="" disabled selected>Selecione uma equipe</option>
                  {#each $teams as equipe}
                    <option value={equipe.id}>{equipe.name}</option>
                  {/each}
                </select>
              </label>
              <label>
                Kills
                <input type="number" min="0" bind:value={$newKills} required placeholder="Kills" />
              </label>
              <label>
                Colocacao
                <input type="number" min="1" max="12" bind:value={$newPosition} required placeholder="Colocacao" />
              </label>
              <button type="submit" class="btn btn-primary" disabled={!$selectedTeamId || $totalDrops <= 0}>
                Adicionar resultado
              </button>
            </form>

            <form class="form-card" on:submit|preventDefault={runOcr}>
              <div class="form-title">Importar resultados por print</div>
              <label>
                API key OCR.Space
                <input type="text" bind:value={ocrApiKey} placeholder="Cole sua API key" autocomplete="off" />
              </label>
              <label>
                Queda
                <input type="number" min="1" max={$totalDrops} bind:value={ocrDrop} required />
              </label>
              <label>
                Prints (1 a 4 arquivos)
                <input type="file" accept="image/*" multiple on:change={(event) => { ocrFiles = Array.from(event.currentTarget.files || []); }} />
              </label>
              <button type="submit" class="btn btn-primary">Processar OCR</button>
              {#if ocrStatus}
                <div class="state">{ocrStatus}</div>
              {/if}
              {#if ocrRows.length > 0}
                <div class="mini-table">
                  <div class="mini-header">
                    <div>Pos</div>
                    <div>Time</div>
                    <div>Kills</div>
                  </div>
                  {#each ocrRows as row, index}
                    <div class="mini-row">
                      <div class="mini-pos">#{row.position}</div>
                      <div class="mini-team">
                        <select value={row.teamId} on:change={(event) => updateOcrRow(index, { teamId: event.currentTarget.value })}>
                          <option value="">Selecione</option>
                          {#each $teams as team}
                            <option value={team.id}>{team.name}</option>
                          {/each}
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          min="0"
                          value={row.kills}
                          on:input={(event) => updateOcrRow(index, { kills: Number(event.currentTarget.value) })}
                        />
                      </div>
                    </div>
                  {/each}
                </div>
                <button type="button" class="btn btn-ghost" on:click={applyOcrResults}>
                  Confirmar resultados
                </button>
              {/if}
            </form>
          </div>

          <div class="reset-row">
            <button class="btn btn-ghost" on:click={resetTournament}>Resetar tabela</button>
          </div>
        </Card>
      </div>
    </section>

  </div>
</div>