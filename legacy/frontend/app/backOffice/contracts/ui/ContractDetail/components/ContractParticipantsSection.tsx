interface ContractParticipantsSectionProps {
  participants: any[] | undefined;
  getRoleLabel: (role: string) => string;
}

export default function ContractParticipantsSection({ participants, getRoleLabel }: ContractParticipantsSectionProps) {
  if (!participants || participants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-4xl">
        <span className="material-symbols-outlined text-4xl mb-2 block">groups</span>
        <p>No hay participantes registrados</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="space-y-3">
        {participants.map((person: any, index: number) => (
          <div key={person.id || index} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">{person.personName}</h4>
              <p className="text-sm text-muted-foreground">RUT: {person.personDni}</p>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
              {getRoleLabel(person.role)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
