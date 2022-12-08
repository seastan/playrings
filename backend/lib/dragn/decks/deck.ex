defmodule DragnCards.Decks.Deck do
  use Ecto.Schema
  import Ecto.Changeset

  schema "decks" do
    field :name, :string
    field :author_id, :id
    field :plugin_id, :id
    field :card_uuids, {:array, :string}
    field :quantities, {:array, :integer}
    field :load_group_ids, {:array, :string}

    timestamps()
  end

  @doc false
  def changeset(deck, attrs) do
    deck
    |> cast(attrs, [:name, :author_id, :plugin_id, :card_uuids, :quantities, :load_group_ids])
    |> validate_required([:name, :author_id, :plugin_id, :card_uuids, :quantities, :load_group_ids])
  end
end
