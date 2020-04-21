defmodule SpadesWeb.API.V1.AdminContactController do
  use SpadesWeb, :controller

  def index(conn, _params) do
    # Just here to show the email after a user clicks,
    # to hopefully prevent spam bots
    conn
    |> json(%{email: "seastan.lotrlcg@gmail.com"})
  end
end
