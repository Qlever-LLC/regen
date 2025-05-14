<script lang="ts">
    const data = {
        regenscore: {
            name: 'Total REGENScore',
            score: 80,
        },
        air: {
            name: 'Air Quality Score',
            score: 90,
        },
        water: {
            name: 'Water Quality Score',
            score: 70,
        },
        soil: {
            name: 'Soil Quality Score',
            score: 80,
        },
        equity: {
            name: 'Equity Score',
            score: 80,
        }
    };
</script>
  
<form method="post">
{#each Object.values(data) as score}
  <div>
    <label>
      {score.name}
      <input type="text" name={score.name} value={score.score} />
    </label>
  </div>
{/each}
<button type="submit">Create</button>
</form>