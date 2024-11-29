const { createApp } = Vue;

createApp({
  data() {
    return {
      pokemons: [],
      loading: true,
      textoBusca: '',
      proximaPagina: 1,
      tipoFiltro: '',
    };
  },
  created() {
    this.chamarAPI();
    window.addEventListener('scroll', this.tratarScroll);
  },
  destroyed() {
    window.removeEventListener('scroll', this.tratarScroll);
  },
  methods: {
    async chamarAPI() {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${(this.proximaPagina - 1) * 151}&limit=${151}`);
        const data = await response.json();
        const promessasDetalhesPokemon = data.results.map(async (pokemon) => this.obterDadosPokemon(pokemon.url));
        const detalhesPokemons = await Promise.all(promessasDetalhesPokemon);
        this.pokemons = [...this.pokemons, ...detalhesPokemons];
        this.proximaPagina++;
        this.loading = false;
      } catch (error) {
        console.error(error);
      }
    },
    async obterDadosPokemon(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        return {
          id: data.id,
          name: data.name,
          weight: data.weight,
          height: data.height,
          abilities: data.abilities,
          base_experience: data.base_experience,
          types: data.types,
          sprites: data.sprites,
        };
      } catch (e) {
        console.error(e);
      }
    },
    tratarScroll() {
      const fimDaPagina = document.documentElement.scrollTop + window.innerHeight >= document.documentElement.offsetHeight;
      if (fimDaPagina && !this.loading) {
        this.loading = true;
        this.chamarAPI();
      }
    },
    obterClasseTipo(pokemon) {
      const coresTipo = {
        fire: '#FF6347',
        water: '#1E90FF',
        grass: '#228B22',
        electric: '#FFD700',
        dragon: '#8A2BE2',
        bug: '#32CD32',
      };

      const tipoPrincipal = pokemon.types[0].type.name;
      const corTipo = coresTipo[tipoPrincipal] || '#7cd07f';

      return {
        backgroundColor: corTipo,
        color: 'white',
      };
    },
    async buscarPokemon() {
      if (!this.textoBusca) return;
      this.loading = true;
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${this.textoBusca.toLowerCase()}`);
        const data = await response.json();
        this.pokemons = [data];
        this.loading = false;
      } catch (error) {
        console.error('Pokemon não encontrado', error);
        this.loading = false;
      }
    },
    filtrarPokemons() {
      if (this.tipoFiltro) {
        this.pokemons = this.pokemons.filter(pokemon =>
          pokemon.types.some(type => type.type.name === this.tipoFiltro)
        );
      } else {
        this.chamarAPI();
      }
    },
  },
}).mount('#app');
