defmodule DragnCards.Replay do
  use Ecto.Schema
  import Ecto.Changeset

  schema "replays" do
    field :user, :integer
    field :uuid, :string
    field :encounter, :string
    field :rounds, :integer
    field :num_players, :integer
    field :player1_heroes, {:array, :string}
    field :player2_heroes, {:array, :string}
    field :player3_heroes, {:array, :string}
    field :player4_heroes, {:array, :string}
    field :deleted_by, {:array, :integer}
    field :game_json, :map
    field :outcome, :string

    timestamps()
  end

  def changeset(replay, params \\ %{}) do
    replay
    |> cast(params, [:user, :uuid, :encounter, :rounds, :num_players, :player1_heroes, :player2_heroes, :player3_heroes, :player4_heroes, :game_json, :outcome])
  end

end
