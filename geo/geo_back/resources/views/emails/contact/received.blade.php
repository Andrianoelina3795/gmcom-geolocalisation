@component('mail::message')
# Nouveau message de contact

**Nom :** {{ $contact['nom'] }}  
**Email :** {{ $contact['email'] }}  
**Téléphone :** {{ $contact['telephone'] ?? 'Non fourni' }}  
**Message :**  
{{ $contact['message'] }}

@endcomponent
