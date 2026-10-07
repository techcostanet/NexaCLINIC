import React from 'react';
import SocialAnamnesePatientView from './SocialAnamnesePatientView';

export default function SocialAnamnesePublicPortal({ patientId, onExitPortal }) {
  return (
    <SocialAnamnesePatientView
      patientId={patientId}
      standalone={true}
      onFinished={() => {
        if (onExitPortal) {
          onExitPortal();
        }
      }}
    />
  );
}
