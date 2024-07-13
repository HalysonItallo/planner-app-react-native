import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Loading } from "@/components/loading";
import { Modal } from "@/components/modal";
import { Participant, ParticipantProps } from "@/components/participant";
import { TripLink, TripLinkProps } from "@/components/trip-link";
import { linksServer } from "@/server/links-server";
import { participantsServer } from "@/server/participant-server";
import { colors } from "@/styles/colors";
import { validateInput } from "@/utils/validateInput";
import { Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Text, View, FlatList } from "react-native";

export function Details({ tripId }: { tripId: string }) {
  //LOADING
  const [isCreatingLinkTrip, setIsCreatingLinkTrip] = useState(false);
  const [isGettingLinkTrip, setIsGettingLinkTrip] = useState(false);
  const [isGettingParticipatingTrip, setIsGettingParticipatingTrip] =
    useState(false);

  //MODAL
  const [showModal, setShowModal] = useState(false);

  //DATA
  const [linkTitle, setLinkTitle] = useState("");
  const [linkURL, setLinkURL] = useState("");

  //LISTS
  const [links, setLinks] = useState<TripLinkProps[]>([]);
  const [participants, setParticipants] = useState<ParticipantProps[]>([]);

  function resetNewLinkFields() {
    setLinkTitle("");
    setLinkURL("");
    setShowModal(false);
  }

  async function handleCreateLinkTrip() {
    try {
      if (!linkTitle.trim()) {
        return Alert.alert("Link", "Informe o título do link.");
      }

      if (!validateInput.url(linkURL.trim())) {
        return Alert.alert("Link", "Link inválido.");
      }

      setIsCreatingLinkTrip(true);

      await linksServer.create({ title: linkTitle, url: linkURL, tripId });

      Alert.alert("Link", "Link criado com sucesso!");

      resetNewLinkFields();

      await getTripLinks();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreatingLinkTrip(false);
    }
  }

  async function getTripLinks() {
    try {
      setIsGettingLinkTrip(true);
      const links = await linksServer.getLinksByTripId(tripId);
      setLinks(links);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGettingLinkTrip(false);
    }
  }

  async function getTripParticipants() {
    try {
      setIsGettingParticipatingTrip(true);
      const participants = await participantsServer.getByTripId(tripId);
      setParticipants(participants);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGettingParticipatingTrip(false);
    }
  }

  useEffect(() => {
    getTripLinks();
    getTripParticipants();
  }, []);

  return (
    <View className="flex-1 mt-10">
      <Text className="text-zinc-50 text-2xl font-semibold mb-2">
        Links importantes
      </Text>
      <View className="flex-1">
        {links.length > 0 ? (
          isGettingLinkTrip ? (
            <Loading />
          ) : (
            <FlatList
              data={links}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TripLink data={item} />}
              contentContainerClassName="gap-4"
            />
          )
        ) : (
          <Text className="text-zinc-400 font-regular text-base mt-2 mb-6">
            Nenhum link adicionado
          </Text>
        )}
        <Button variant="secondary" onPress={() => setShowModal(true)}>
          <Plus color={colors.zinc[200]} size={20} />
          <Button.Title>Cadastrar novo link</Button.Title>
        </Button>
      </View>

      <View className="flex-1 border-t border-zinc-800 mt-6">
        <Text className="text-zinc-50 text-2xl font-semibold my-6">
          Convidados
        </Text>
        {isGettingParticipatingTrip ? (
          <Loading />
        ) : (
          <FlatList
            data={participants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <Participant data={item} />}
            contentContainerClassName="gap-4 pb-44"
          />
        )}
      </View>

      <Modal
        title="Cadastrar link"
        subtitle="Todos os convidados podem visualizar os links importantes"
        visible={showModal}
        onClose={() => setShowModal(false)}
      >
        <View className="gap-2 mb-3">
          <Input variant="secondary">
            <Input.Field
              placeholder="Título do link"
              onChangeText={setLinkTitle}
              value={linkTitle}
            />
          </Input>

          <Input variant="secondary">
            <Input.Field
              placeholder="URL"
              onChangeText={setLinkURL}
              value={linkURL}
            />
          </Input>
        </View>
        <Button isLoading={isCreatingLinkTrip} onPress={handleCreateLinkTrip}>
          <Button.Title>Salvar link</Button.Title>
        </Button>
      </Modal>
    </View>
  );
}
