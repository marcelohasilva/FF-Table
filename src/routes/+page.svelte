<script lang="ts">
  import {
    equipes,
    resultados,
    novaEquipe,
    totalQuedas,
    equipeSelecionada,
    novasKills,
    novaColocacao,
    quedaSelecionada,
    adicionarEquipe,
    removerEquipe,
    adicionarResultado,
    removerResultado,
    resetarCampeonato,
    getRanking,
    getResultadosPorQueda
  } from '../lib/index';

  import { derived } from 'svelte/store';

  const ranking = derived(resultados, () => getRanking());
  const resultadosPorQueda = derived([resultados, totalQuedas], () => getResultadosPorQueda());
</script>

<div class="container">
  <h2>🏆 Campeonato FF - Resultados por Queda</h2>

  <section>
    <h3>1. Cadastro das Equipes</h3>
    <form on:submit|preventDefault={() => { adicionarEquipe($novaEquipe); novaEquipe.set(''); }}>
      <label>
        Nome da Equipe
        <input type="text" bind:value={$novaEquipe} placeholder="Digite o nome da equipe" required autocomplete="off" />
      </label>
      <button type="submit" disabled={!$novaEquipe.trim()}>Adicionar Equipe</button>
    </form>

    {#if $equipes.length > 0}
      <table>
        <thead>
          <tr><th>Equipe</th><th>Ação</th></tr>
        </thead>
        <tbody>
          {#each $equipes as equipe, i}
            <tr>
              <td>{equipe.nome}</td>
              <td><button class="remover" on:click={() => removerEquipe(i)}>Remover</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>

  <section>
    <h3>2. Configuração do Campeonato</h3>
    <label>
      Total de Quedas (Rodadas)
      <input type="number" min="1" bind:value={$totalQuedas} placeholder="Ex: 12" required />
    </label>
  </section>

  <section>
    <h3>3. Adicionar Resultado por Queda</h3>
    <form on:submit|preventDefault={adicionarResultado}>
      <label>
        Queda
        <input type="number" min="1" max={$totalQuedas} bind:value={$quedaSelecionada} required placeholder={`1 a ${$totalQuedas || "?"}`} />
      </label>

      <label>
        Equipe
        <select bind:value={$equipeSelecionada} required>
          <option value="" disabled selected>Selecione uma equipe</option>
          {#each $equipes as equipe}
            <option value={equipe.nome}>{equipe.nome}</option>
          {/each}
        </select>
      </label>

      <label>
        Kills
        <input type="number" min="0" bind:value={$novasKills} required placeholder="Kills da partida" />
      </label>

      <label>
        Colocação
        <input type="number" min="1" max="12" bind:value={$novaColocacao} required placeholder="Colocação" />
      </label>

      <button type="submit" disabled={!$equipeSelecionada || $totalQuedas <= 0}>Adicionar Resultado</button>
    </form>
  </section>

  <section>
    <h3>Resultados por Queda</h3>
    {#if $totalQuedas === 0}
      <p style="text-align:center; color:#777;">Defina o total de quedas para exibir resultados.</p>
    {:else}
      {#each Array($totalQuedas) as _, i}
        <h4>Queda {i + 1}</h4>
        {#if $resultadosPorQueda[i + 1]?.length > 0}
          <table>
            <thead>
              <tr><th>Equipe</th><th>Kills</th><th>Colocação</th><th>Pontos</th><th>Ação</th></tr>
            </thead>
            <tbody>
              {#each $resultadosPorQueda[i + 1] as res}
                <tr>
                  <td>{res.equipe}</td>
                  <td>{res.kills}</td>
                  <td>{res.colocacao}º</td>
                  <td>{res.pontos}</td>
                  <td><button class="remover" on:click={() => removerResultado($resultados.indexOf(res))}>Remover</button></td>
                </tr>
              {/each}
            </tbody>
          </table>
        {:else}
          <p style="text-align:center; color:#777;">Nenhum resultado para esta queda.</p>
        {/if}
      {/each}
    {/if}
  </section>

  <section>
    <h3>🏅 Ranking Geral</h3>
    {#if $ranking.length === 0}
      <p style="text-align:center; color:#777;">Nenhum resultado para gerar ranking.</p>
    {:else}
      <table>
        <thead>
          <tr><th>Posição</th><th>Equipe</th><th>Quedas</th><th>Kills Totais</th><th>Pontos Totais</th></tr>
        </thead>
        <tbody>
          {#each $ranking as time, i}
            <tr>
              <td>{i + 1}º</td>
              <td>{time.equipe}</td>
              <td>{time.quedas}</td>
              <td>{time.kills}</td>
              <td>{time.pontos}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>

  <section style="text-align:center; margin-top: 2rem;">
    <button on:click={resetarCampeonato} style="background:#e67e22;">🔄 Resetar Tabela</button>
  </section>
</div>
