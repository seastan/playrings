defmodule DragnCardsChat.ChatMessage do
  @moduledoc """
  Represents a seat at a table.
  The integers here are user ids.
  """

  alias DragnCardsChat.{ChatMessage}

  @derive Jason.Encoder
  defstruct [:text, :sent_by, :when, :shortcode, :game_update]

  use Accessible

  @type t :: %ChatMessage{
          text: String.t(),
          sent_by: integer | nil,
          when: DateTime.t(),
          shortcode: String.t()
        }

  @spec new(String.t(), integer | nil) :: ChatMessage.t()
  def new(text, sent_by) do
    %ChatMessage{
      text: text,
      sent_by: sent_by,
      when: DateTime.utc_now(),
      shortcode: shortcode()
    }
  end

  defp shortcode() do
    :crypto.strong_rand_bytes(6) |> Base.url_encode64()
  end
end
