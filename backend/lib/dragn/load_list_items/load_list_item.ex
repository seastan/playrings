defmodule DragnCards.LoadListItems.LoadListItem do
  use Ecto.Schema
  import Ecto.Changeset

  schema "load_list_items" do
    field :load_group_id, :string
    field :quantity, :integer
    field :deck_id, :id

    timestamps()
  end

  @doc false
  def changeset(load_list_item, attrs) do
    load_list_item
    |> cast(attrs, [:quantity, :load_group_id])
    |> validate_required([:quantity, :load_group_id])
  end
end
