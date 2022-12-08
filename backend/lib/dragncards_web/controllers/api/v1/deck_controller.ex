defmodule DragnCardsWeb.API.V1.DeckController do
  use DragnCardsWeb, :controller
  import Ecto.Query

  alias DragnCards.{Decks.Deck, Decks, Repo}

  def index(conn, _params) do
    decks = Decks.list_decks()
    render(conn, "index.html", decks: decks)
  end

  def new(conn, _params) do
    changeset = Decks.change_deck(%Deck{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"deck" => deck_params}) do
    case Decks.create_deck(deck_params) do
      {:ok, deck} ->
        conn
        |> json(%{success: %{message: "Deck saved successfully", deck_id: deck.id}})

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    deck = Decks.get_deck!(id)
    render(conn, "show.html", deck: deck)
  end

  def get_decks(conn, %{"user_id" => user_id, "plugin_id" => plugin_id}) do

    my_decks = if user_id != nil and user_id != "undefined" do
      query = from d in Deck,
        order_by: [desc: :updated_at],
        where: [author_id: ^user_id, plugin_id: ^plugin_id],
        select: d
      Repo.all(query)
    else
      []
    end
    #IO.inspect(my_decks)
    my_decks = Enum.reduce(my_decks, [], fn(deck, acc) ->
      acc ++ [Map.from_struct(deck) |> Map.delete(:__meta__)]
    end)
    IO.puts("get_decks")
    IO.inspect(my_decks)
    json(conn, %{my_decks: my_decks})
  end

  def edit(conn, %{"id" => id}) do
    deck = Decks.get_deck!(id)
    changeset = Decks.change_deck(deck)
    render(conn, "edit.html", deck: deck, changeset: changeset)
  end

  def update(conn, %{"id" => id, "deck" => deck_params}) do
    deck = Decks.get_deck!(id)

    case Decks.update_deck(deck, deck_params) do
      {:ok, deck} ->
        conn
        |> put_flash(:info, "Deck updated successfully.")
        |> redirect(to: Routes.deck_path(conn, :show, deck))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", deck: deck, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    deck = Decks.get_deck!(id)
    {:ok, _deck} = Decks.delete_deck(deck)

    conn
    |> put_flash(:info, "Deck deleted successfully.")
    |> redirect(to: Routes.deck_path(conn, :index))
  end
end
