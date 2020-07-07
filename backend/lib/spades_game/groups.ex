defmodule SpadesGame.Groups do
  @moduledoc """

  """
  alias SpadesGame.{Groups,Group}

  @type t :: Map.t()

  @doc """
  """
  @spec new() :: Map.t()
  def new() do
    %{
      "gSharedQuestDeck"=>         Group.new("gSharedQuestDeck","Quest","hand","cShared"),
      "gSharedQuestDiscard"=>      Group.new("gSharedQuestDiscard","Quest Discard","discard","cShared"),
      "gSharedEncounterDeck"=>     Group.new_deck("gSharedEncounterDeck","Encounter","deck","cShared"),
      "gSharedEncounterDiscard"=>  Group.new("gSharedEncounterDiscard","Enc Discard","discard","cShared"),
      "gSharedQuestDeck2"=>        Group.new("gSharedQuestDeck2","Quest 2","hand","cShared"),
      "gSharedQuestDiscard2"=>     Group.new("gSharedQuestDiscard2","Quest Discard 2","discard","cShared"),
      "gSharedEncounterDeck2"=>    Group.new("gSharedEncounterDeck2","Encounter 2","deck","cShared"),
      "gSharedEncounterDiscard2"=> Group.new("gSharedEncounterDiscard2","Enc Discard 2","discard","cShared"),
      "gSharedOther"=>             Group.new("gSharedOther","Other","hand","cShared"),
      "gSharedVictory"=>           Group.new("gSharedVictory","Victory Display","hand","cShared"),
      "gSharedStaging"=>           Group.new("gSharedStaging","Staging Area","play","cShared"),
      "gSharedActive"=>            Group.new("gSharedActive","Active Location","play","cShared"),
      "gSharedMainQuest"=>         Group.new("gSharedMainQuest","Main Quest","play","cShared"),
      "gSharedExtra1"=>            Group.new("gSharedExtra1","Extra1","play","cShared"),
      "gSharedExtra2"=>            Group.new("gSharedExtra2","Extra2","play","cShared"),
      "gSharedExtra3"=>            Group.new("gSharedExtra3","Extra3","play","cShared"),
      "gPlayer1Hand"=>             Group.new("gPlayer1Hand","Hand","hand","cPlayer1"),
      "gPlayer1Deck"=>             Group.new_deck("gPlayer1Deck","Deck","deck","cPlayer1"),
      "gPlayer1Discard"=>          Group.new("gPlayer1Discard","Discard","discard","cPlayer1"),
      "gPlayer1Sideboard"=>        Group.new("gPlayer1Sideboard","Sideboard","discard","cPlayer1"),
      "gPlayer1Play1"=>            Group.new("gPlayer1Play1","Play Area","play","cPlayer1"),
      "gPlayer1Play2"=>            Group.new("gPlayer1Play2","","play","cPlayer1"),
      "gPlayer1Engaged"=>          Group.new("gPlayer1Engaged","Engaged","play","cPlayer1"),
      "gPlayer1Event"=>            Group.new("gPlayer1Event","Active Event","play","cPlayer1"),
      "gPlayer2Hand"=>             Group.new("gPlayer2Hand","Hand","hand","cPlayer2"),
      "gPlayer2Deck"=>             Group.new("gPlayer2Deck","Deck","deck","cPlayer2"),
      "gPlayer2Discard"=>          Group.new("gPlayer2Discard","Discard","discard","cPlayer2"),
      "gPlayer2Sideboard"=>        Group.new("gPlayer2Sideboard","Sideboard","discard","cPlayer2"),
      "gPlayer2Play1"=>            Group.new("gPlayer2Play1","Play Area","play","cPlayer2"),
      "gPlayer2Play2"=>            Group.new("gPlayer2Play2","","play","cPlayer2"),
      "gPlayer2Engaged"=>          Group.new("gPlayer2Engaged","Engaged","play","cPlayer2"),
      "gPlayer2Event"=>            Group.new("gPlayer2Event","Active Event","play","cPlayer2"),
      "gPlayer3Hand"=>             Group.new("gPlayer3Hand","Hand","hand","cPlayer3"),
      "gPlayer3Deck"=>             Group.new("gPlayer3Deck","Deck","deck","cPlayer3"),
      "gPlayer3Discard"=>          Group.new("gPlayer3Discard","Discard","discard","cPlayer3"),
      "gPlayer3Sideboard"=>        Group.new("gPlayer3Sideboard","Sideboard","discard","cPlayer3"),
      "gPlayer3Play1"=>            Group.new("gPlayer3Play1","Play Area","play","cPlayer3"),
      "gPlayer3Play2"=>            Group.new("gPlayer3Play2","","play","cPlayer3"),
      "gPlayer3Engaged"=>          Group.new("gPlayer3Engaged","Engaged","play","cPlayer3"),
      "gPlayer3Event"=>            Group.new("gPlayer3Event","Active Event","play","cPlayer3"),
      "gPlayer4Hand"=>             Group.new("gPlayer4Hand","Hand","hand","cPlayer4"),
      "gPlayer4Deck"=>             Group.new("gPlayer4Deck","Deck","deck","cPlayer4"),
      "gPlayer4Discard"=>          Group.new("gPlayer4Discard","Discard","discard","cPlayer4"),
      "gPlayer4Sideboard"=>        Group.new("gPlayer4Sideboard","Sideboard","discard","cPlayer4"),
      "gPlayer4Play1"=>            Group.new("gPlayer4Play1","Play Area","play","cPlayer4"),
      "gPlayer4Play2"=>            Group.new("gPlayer4Play2","","play","cPlayer4"),
      "gPlayer4Engaged"=>          Group.new("gPlayer4Engaged","Engaged","play","cPlayer4"),
      "gPlayer4Event"=>            Group.new("gPlayer4Event","Active Event","play","cPlayer4"),
    }
  end

end
