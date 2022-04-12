defmodule DragnCardsWeb.PageController do
  use DragnCardsWeb, :controller

  def index(conn, _params) do
    html(conn, File.read!("./priv/static/index.html"))
  end

  def json_test(conn, _params) do
    conn
    |> json(%{id: 123})
  end

  def default_image(conn, _params) do
    conn
    |> send_file(200, "./priv/static/images/cardbacks/player.jpg")
  end
end
