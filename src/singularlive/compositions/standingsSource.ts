import { MeetDocument } from 'src/liftingcast/liftingcast.enteties';

export class StandingsSourceWidget {
  compID = '34210110-01ad-fb71-ae95-7cea34bf3f9c';

  buildPayload = (meetState: MeetDocument) => {
    const singularLifters = meetState.lifters.map((lifter) => {
      const singularLifter = {
        id: lifter.id,
        name: lifter.name,
        gender: lifter.gender,
        team: lifter.team,
        state: lifter.state,
        country: lifter.country,
        bodyWeight: lifter.bodyWeight,
        lot: lifter.lot,
        session: lifter.session,
        flight: lifter.flight,
        platform: lifter.platform,
        divisions: lifter.divisions
          .filter((division) => division.divisionId)
          .map((division) => {
            const lcDivision = meetState.divisions.find(
              (lcDivision) => lcDivision.id === division.divisionId,
            );
            return {
              name: lcDivision.name,
              weightClass: lcDivision.weightClasses.find(
                (weightClass) => weightClass.id === division.weightClassId,
              ).name,
              score: division.score,
              forecastedScore: Number(division.forecastedScore).toFixed(2),
              place: division.place,
              forecastedPlace: division.forecastedPlace,
              total: division.total,
              forecastedTotal: division.forecastedTotal,
            };
          }),

        lifts: lifter.lifts,
      };
      return singularLifter;
    });
    return { lifters: JSON.stringify(singularLifters) };
  };
}

export type StandingsSourcePayload = {
  lifters: string;
};
