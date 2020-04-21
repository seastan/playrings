defmodule Spades.UserEmail do
  @moduledoc """
  Emails are defined in here.
  """
  import Swoosh.Email

  def welcome(user) do
    new()
    |> to({user.name, user.email})
    |> from({"OneRingTeki", "noreply@noreply.oneringteki.com"})
    |> subject("Welcome!")
    |> html_body("<h1>Hello #{user.name}</h1>")
    |> text_body("Hello #{user.name}\n")
  end

  def another_test_email(user) do
    new()
    |> to({user.name, user.email})
    |> from({"OneRingTeki", "noreply@noreply.oneringteki.com"})
    |> subject("A third email test.")
    |> html_body(
      "This is a third email test.  I don't want to send the same email over and over while testing my development out..."
    )
    |> text_body(
      "This is a third email test.  I don't want to send the same email over and over while testing my development out..."
    )
  end
end
