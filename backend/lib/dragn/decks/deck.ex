defmodule DragnCards.Decks.Deck do
  use Ecto.Schema
  import Ecto.Changeset

  schema "decks" do
    field :name, :string
    field :author_id, :id
    field :plugin_id, :id

    timestamps()
  end

  @doc false
  def changeset(deck, attrs) do
    deck
    |> cast(attrs, [:name, :author_id, :plugin_id])
    |> validate_required([:name, :author_id, :plugin_id])
  end
end
