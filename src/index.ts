import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { staticPlugin } from "@elysiajs/static";
import { cors } from "@elysiajs/cors";

import POKEMONS from "./pokemon.json";

let pokemonData = [...POKEMONS];

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Pokémon API",
          version: "1.0.0",
          description: "API for managing Pokémon data",
        },
        tags: [
          { name: "Pokémon", description: "Pokémon management endpoints" },
        ],
      },
    })
  )
  .use(staticPlugin())
  .use(cors());

const PokemonSchema = t.Object({
  id: t.Number(),
  name: t.Object({
    english: t.String(),
    japanese: t.String(),
    chinese: t.String(),
    french: t.String(),
  }),
  type: t.Array(t.String()),
  base: t.Object({
    HP: t.Number(),
    Attack: t.Number(),
    Defense: t.Number(),
    "Sp. Attack": t.Number(),
    "Sp. Defense": t.Number(),
    Speed: t.Number(),
  }),
});

app.group("/api/pokemon", (app) =>
  app
    .get("/", () => pokemonData, {
      detail: {
        tags: ["Pokémon"],
        summary: "Get all Pokémon",
      },
    })

    .get(
      "/:id",
      ({ params: { id } }) => {
        const pokemon = pokemonData.find(
          (p) => p.id === parseInt(typeof id === "string" ? id : id.toString())
        );
        if (!pokemon) {
          throw new Error("Pokémon not found");
        }
        return pokemon;
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
        detail: {
          tags: ["Pokémon"],
          summary: "Get a Pokémon by ID",
        },
      }
    )

    .post(
      "/",
      ({ body }) => {
        const newId = Math.max(...pokemonData.map((p) => p.id)) + 1;
        //@ts-ignore
        const newPokemon = { id: newId, ...body };
        pokemonData.push(newPokemon);
        return newPokemon;
      },
      {
        body: PokemonSchema,
        detail: {
          tags: ["Pokémon"],
          summary: "Create a new Pokémon",
        },
      }
    )

    .put(
      "/:id",
      ({ params: { id }, body }) => {
        const index = pokemonData.findIndex(
          (p) => p.id === parseInt(typeof id === "string" ? id : id.toString())
        );
        if (index === -1) {
          throw new Error("Pokémon not found");
        }
        pokemonData[index] = { ...pokemonData[index], ...body };
        return pokemonData[index];
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
        body: PokemonSchema,
        detail: {
          tags: ["Pokémon"],
          summary: "Update a Pokémon",
        },
      }
    )

    .delete(
      "/:id",
      ({ params: { id } }) => {
        const index = pokemonData.findIndex(
          (p) => p.id === parseInt(typeof id === "string" ? id : id.toString())
        );
        if (index === -1) {
          throw new Error("Pokémon not found");
        }
        const deletedPokemon = pokemonData.splice(index, 1)[0];
        return { message: "Pokémon deleted", deletedPokemon };
      },
      {
        params: t.Object({
          id: t.Numeric(),
        }),
        detail: {
          tags: ["Pokémon"],
          summary: "Delete a Pokémon",
        },
      }
    )

    .get(
      "/refresh",
      () => {
        pokemonData = [...POKEMONS];
        return { message: "Pokémon data refreshed" };
      },
      {
        detail: {
          tags: ["Pokémon"],
          summary: "Refresh Pokémon data",
        },
      }
    )
    .get(
      "/search",
      ({ query: { name } }) => {
        const lowercaseName = name.toLowerCase();
        return pokemonData.filter((pokemon) =>
          Object.values(pokemon.name).some((nameLang) =>
            nameLang.toLowerCase().includes(lowercaseName)
          )
        );
      },
      {
        query: t.Object({
          name: t.String(),
        }),
        detail: {
          tags: ["Pokémon"],
          summary: "Search Pokémon by name (case-insensitive)",
        },
      }
    )
);

app.listen(process.env.PORT || 3000);

console.log("Pokémon API is running on http://localhost:3000");
console.log("Swagger documentation available at http://localhost:3000/swagger");
