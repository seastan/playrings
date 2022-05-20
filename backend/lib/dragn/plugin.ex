defmodule DragnCards.Plugin do
  use Ecto.Schema
  import Ecto.Changeset

  @derive {Jason.Encoder, only: [:game_def, :card_db]}

  schema "plugins" do

    field :user_id, :integer
    field :plugin_uuid, :string
    field :plugin_name, :string
    field :version, :integer
    field :game_def, :map
    field :card_db, :map
    field :subscribers, :integer
    field :public, :boolean

    timestamps()
  end

  def changeset(replay, params \\ %{}) do
    replay
    |> cast(params, [:user_id, :plugin_uuid, :plugin_name, :version, :game_def, :card_db, :subscribers, :public])
  end

end
