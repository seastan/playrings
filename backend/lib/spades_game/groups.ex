defmodule SpadesGame.Groups do
  @moduledoc """

  """
  alias SpadesGame.{Groups,Group}

  @derive Jason.Encoder
  defstruct [
    :gSharedQuest,
    :gSharedQuestDiscard,
    :gSharedEncounter,
    :gSharedEncounterDiscard,
    :gSharedQuest2,
    :gSharedQuestDiscard2,
    :gSharedEncounter2,
    :gSharedEncounterDiscard2,
    :gSharedOther,
    :gSharedVictory,
    :gPlayer1Hand,
    :gPlayer1Deck,
    :gPlayer1Discard,
    :gPlayer1Sideboard,
    :gPlayer2Hand,
    :gPlayer2Deck,
    :gPlayer2Discard,
    :gPlayer2Sideboard,
    :gPlayer3Hand,
    :gPlayer3Deck,
    :gPlayer3Discard,
    :gPlayer3Sideboard,
    :gPlayer4Hand,
    :gPlayer4Deck,
    :gPlayer4Discard,
    :gPlayer4Sideboard
  ]

  use Accessible

  @type t :: %Groups{
    gSharedQuest: Group.t(),
    gSharedQuestDiscard: Group.t(),
    gSharedEncounter: Group.t(),
    gSharedEncounterDiscard: Group.t(),
    gSharedQuest2: Group.t(),
    gSharedQuestDiscard2: Group.t(),
    gSharedEncounter2: Group.t(),
    gSharedEncounterDiscard2: Group.t(),
    gSharedOther: Group.t(),
    gSharedVictory: Group.t(),
    gPlayer1Hand: Group.t(),
    gPlayer1Deck: Group.t(),
    gPlayer1Discard: Group.t(),
    gPlayer1Sideboard: Group.t(),
    gPlayer2Hand: Group.t(),
    gPlayer2Deck: Group.t(),
    gPlayer2Discard: Group.t(),
    gPlayer2Sideboard: Group.t(),
    gPlayer3Hand: Group.t(),
    gPlayer3Deck: Group.t(),
    gPlayer3Discard: Group.t(),
    gPlayer3Sideboard: Group.t(),
    gPlayer4Hand: Group.t(),
    gPlayer4Deck: Group.t(),
    gPlayer4Discard: Group.t(),
    gPlayer4Sideboard: Group.t()
  }

  @doc """
  """
  @spec new() :: Groups.t()
  def new() do
    %Groups{
      gSharedQuest:             Group.new("gSharedQuest","Quest","hand","cShared"),
      gSharedQuestDiscard:      Group.new("gSharedQuestDiscard","Quest Discard","discard","cShared"),
      gSharedEncounter:         Group.new("gSharedEncounter","Encounter","deck","cShared"),
      gSharedEncounterDiscard:  Group.new("gSharedEncounterDiscard","Encounter Disc","discard","cShared"),
      gSharedQuest2:            Group.new("gSharedQuest2","Quest 2","hand","cShared"),
      gSharedQuestDiscard2:     Group.new("gSharedQuestDiscard2","Quest Discard 2","discard","cShared"),
      gSharedEncounter2:        Group.new("gSharedEncounter2","Encounter 2","deck","cShared"),
      gSharedEncounterDiscard2: Group.new("gSharedEncounterDiscard2","Encounter Discard 2","discard","cShared"),
      gSharedOther:             Group.new("gSharedOther","Other","hand","cShared"),
      gSharedVictory:           Group.new("gSharedVictory","Victory Display","hand","cShared"),
      gPlayer1Hand:             Group.new("gPlayer1Hand","Hand","hand","cPlayer1"),
      gPlayer1Deck:             Group.new("gPlayer1Deck","Deck","deck","cPlayer1"),
      gPlayer1Discard:          Group.new("gPlayer1Discard","Discard","discard","cPlayer1"),
      gPlayer1Sideboard:        Group.new("gPlayer1Sideboard","Sideboard","discard","cPlayer1"),
      gPlayer2Hand:             Group.new("gPlayer2Hand","Hand","hand","cPlayer2"),
      gPlayer2Deck:             Group.new("gPlayer2Deck","Deck","deck","cPlayer2"),
      gPlayer2Discard:          Group.new("gPlayer2Discard","Discard","discard","cPlayer2"),
      gPlayer2Sideboard:        Group.new("gPlayer2Sideboard","Sideboard","discard","cPlayer2"),
      gPlayer3Hand:             Group.new("gPlayer3Hand","Hand","hand","cPlayer3"),
      gPlayer3Deck:             Group.new("gPlayer3Deck","Deck","deck","cPlayer3"),
      gPlayer3Discard:          Group.new("gPlayer3Discard","Discard","discard","cPlayer3"),
      gPlayer3Sideboard:        Group.new("gPlayer3Sideboard","Sideboard","discard","cPlayer3"),
      gPlayer4Hand:             Group.new("gPlayer4Hand","Hand","hand","cPlayer4"),
      gPlayer4Deck:             Group.new("gPlayer4Deck","Deck","deck","cPlayer4"),
      gPlayer4Discard:          Group.new("gPlayer4Discard","Discard","discard","cPlayer4"),
      gPlayer4Sideboard:        Group.new("gPlayer4Sideboard","Sideboard","discard","cPlayer4")
    }
  end

end








