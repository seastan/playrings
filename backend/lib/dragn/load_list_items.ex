defmodule DragnCards.LoadListItems do
  @moduledoc """
  The LoadListItems context.
  """

  import Ecto.Query, warn: false
  alias DragnCards.Repo

  alias DragnCards.LoadListItems.LoadListItem

  @doc """
  Returns the list of load_list_items.

  ## Examples

      iex> list_load_list_items()
      [%LoadListItem{}, ...]

  """
  def list_load_list_items do
    Repo.all(LoadListItem)
  end

  @doc """
  Gets a single load_list_item.

  Raises `Ecto.NoResultsError` if the Load list item does not exist.

  ## Examples

      iex> get_load_list_item!(123)
      %LoadListItem{}

      iex> get_load_list_item!(456)
      ** (Ecto.NoResultsError)

  """
  def get_load_list_item!(id), do: Repo.get!(LoadListItem, id)

  @doc """
  Creates a load_list_item.

  ## Examples

      iex> create_load_list_item(%{field: value})
      {:ok, %LoadListItem{}}

      iex> create_load_list_item(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_load_list_item(attrs \\ %{}) do
    %LoadListItem{}
    |> LoadListItem.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a load_list_item.

  ## Examples

      iex> update_load_list_item(load_list_item, %{field: new_value})
      {:ok, %LoadListItem{}}

      iex> update_load_list_item(load_list_item, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_load_list_item(%LoadListItem{} = load_list_item, attrs) do
    load_list_item
    |> LoadListItem.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a load_list_item.

  ## Examples

      iex> delete_load_list_item(load_list_item)
      {:ok, %LoadListItem{}}

      iex> delete_load_list_item(load_list_item)
      {:error, %Ecto.Changeset{}}

  """
  def delete_load_list_item(%LoadListItem{} = load_list_item) do
    Repo.delete(load_list_item)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking load_list_item changes.

  ## Examples

      iex> change_load_list_item(load_list_item)
      %Ecto.Changeset{data: %LoadListItem{}}

  """
  def change_load_list_item(%LoadListItem{} = load_list_item, attrs \\ %{}) do
    LoadListItem.changeset(load_list_item, attrs)
  end
end
