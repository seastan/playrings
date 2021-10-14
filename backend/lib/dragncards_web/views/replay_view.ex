defmodule DragnCardsWeb.ReplayView do
  use DragnCardsWeb, :view
  alias DragnCardsWeb.ReplayView

  def render("index.json", %{replays: replays}) do
    %{data: render_many(replays, ReplayView, "replay.json")}
  end

  def render("show.json", %{replay: replay}) do
    %{data: render_one(replay, ReplayView, "replay.json")}
  end

  def format_heroes(heroes) do
    Enum.reduce(heroes, "", fn(hero, acc) -> acc <> hero <> " "; end)
  end

  def render("replay.json", %{replay: replay}) do
    %{
      id: replay.id,
      uuid: replay.uuid,
      encounter: replay.encounter,
      rounds: replay.rounds,
      num_players: replay.num_players,
      player1_heroes: format_heroes(replay.player1_heroes),
      player2_heroes: format_heroes(replay.player2_heroes),
      player3_heroes: format_heroes(replay.player3_heroes),
      player4_heroes: format_heroes(replay.player4_heroes),
      deleted_by: replay.deleted_by,
      #game_json: replay.game_json,
      updated_at: String.slice(NaiveDateTime.to_string(replay.updated_at), 0..15),
    }
  end
end
