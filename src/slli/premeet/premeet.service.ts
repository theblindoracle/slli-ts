import { Injectable } from '@nestjs/common';
import { MeetDocument } from 'src/liftingcast/liftingcast.enteties';
import { LiftingcastService } from 'src/liftingcast/liftingcast.service';
import { AgeGroup, EquipmentLevel, Gender } from '../slli.enteties';
import { UsaplService } from 'src/usapl/usapl.service';

@Injectable()
export class SlliPreMeetService {
  constructor(
    private readonly liftingcastService: LiftingcastService,
    private readonly usaplDbService: UsaplService,
  ) { }

  async generatePreMeetReport() {
    // get roster and their divisions from liftingcast
    // const liftingcastData = await this.liftingcastService.getMeetData();
    // get records from usapl database
    // get relavent records for lifter
    // save to file
  }

  private async getRecordsForLifters(meetDocument: MeetDocument) {
    const divisionDecoder = new LiftingcastDivisionDecoder();
    meetDocument.lifters.forEach((lifter) => {
      const lifterDivision = lifter.divisions[0];
      const divisionDetails = meetDocument.divisions.find(
        (division) => division.id === lifterDivision.divisionId,
      );
      const details = divisionDecoder.decode(divisionDetails.name);

      this.usaplDbService.getRecords();
    });
  }
}

class LiftingcastDivisionDecoder {
  decode(liftingcastDivisionName: string): DivisionDetails {
    const gender = this.getGender(liftingcastDivisionName);
    const equipmentLevel = this.getEquipment(liftingcastDivisionName);
    const ageGroup = this.getAgeGroup(liftingcastDivisionName);

    return { gender, equipmentLevel, ageGroup };
  }

  getGender(divisionName: string): Gender {
    const mensRegex = /Men\'s/;
    const womensRegex = /Women\'s/;
    const mxRegex = /Mx/;

    if (mensRegex.test(divisionName)) {
      return Gender.Male;
    }
    if (womensRegex.test(divisionName)) {
      return Gender.Female;
    }
    if (mxRegex.test(divisionName)) {
      return Gender.Mx;
    }
    return Gender.Unknown;
  }

  getEquipment(divisionName: string): EquipmentLevel {
    const equippedRegex = /Equipped/;
    const rawRegex = /(?!Raw With Wraps)(Raw)/;
    const rawWithWrapsRegex = /Raw With Wraps/;

    if (equippedRegex.test(divisionName)) {
      return EquipmentLevel.Equipped;
    }
    if (rawRegex.test(divisionName)) {
      return EquipmentLevel.Raw;
    }
    if (rawWithWrapsRegex.test(divisionName)) {
      return EquipmentLevel.Equipped;
    }
    return EquipmentLevel.Unknown;
  }

  getAgeGroup(divisionName: string): AgeGroup {
    const youthRegex = /Youth/;
    const youth1Regex = /Youth \(8-9\)/;
    const youth2Regex = /Youth \(10-11\)/;
    const youth3Regex = /Youth \(12-13\)/;
    const teenRegex = /Teen/;
    const teen1Regex = /Teen I/;
    const teen2Regex = /Teen II/;
    const teen3Regex = /Teen III/;
    const juniorRegex = /Junior/;
    const openRegex = /Open/;
    const masterRegex = /(?!Master [ABI])(Master)/;
    const master1Regex = /(?!Master I[AB])(Master I)/;
    const master1aRegex = /Master IA/;
    const master1bRegex = /Master IB/;
    const master2Regex = /(?!Master II[AB])(Master II)/;
    const master2aRegex = /Master IIA/;
    const master2bRegex = /Master IIB/;
    const master3Regex = /(?!Master III[AB])(Master III)/;
    const master3aRegex = /Master IIIA/;
    const master3bRegex = /Master IIIB/;
    const master4Regex = /(?!Master IV[AB])(Master IV)/;
    const master4aRegex = /Master IVA/;
    const master4bRegex = /Master IVB/;
    const master5Regex = /(?!Master V[AB])(Master V)/;
    const master5aRegex = /Master VA/;
    const master5bRegex = /Master VB/;
    const master6Regex = /(?!Master VI[AB])(Master VI)/;
    const master6aRegex = /Master VIA/;
    const master6bRegex = /Master VIB/;
    const guestRegex = /Guest/;
    const collegiateRegex = /Collegiate/;
    const highSchoolRegex = /(?!High School [JV])(High School)/;
    const highSchoolVarsityRegex = /High School V/;
    const highSchoolJuniorVarsityRegex = /High School JV/;

    if (youth1Regex.test(divisionName)) {
      return AgeGroup.Youth1;
    }
    if (youth2Regex.test(divisionName)) {
      return AgeGroup.Youth2;
    }
    if (youth3Regex.test(divisionName)) {
      return AgeGroup.Youth3;
    }
    if (youthRegex.test(divisionName)) {
      return AgeGroup.Youth;
    }
    if (teen1Regex.test(divisionName)) {
      return AgeGroup.Teen1;
    }
    if (teen2Regex.test(divisionName)) {
      return AgeGroup.Teen2;
    }
    if (teen3Regex.test(divisionName)) {
      return AgeGroup.Teen3;
    }
    if (teenRegex.test(divisionName)) {
      return AgeGroup.Teen;
    }
    if (juniorRegex.test(divisionName)) {
      return AgeGroup.Junior;
    }
    if (openRegex.test(divisionName)) {
      return AgeGroup.Open;
    }
    if (masterRegex.test(divisionName)) {
      return AgeGroup.Master;
    }
    if (master1aRegex.test(divisionName)) {
      return AgeGroup.Master1A;
    }
    if (master1bRegex.test(divisionName)) {
      return AgeGroup.Master1B;
    }
    if (master1Regex.test(divisionName)) {
      return AgeGroup.Master1;
    }
    if (master2aRegex.test(divisionName)) {
      return AgeGroup.Master2A;
    }
    if (master2bRegex.test(divisionName)) {
      return AgeGroup.Master2B;
    }
    if (master2Regex.test(divisionName)) {
      return AgeGroup.Master2;
    }
    if (master3aRegex.test(divisionName)) {
      return AgeGroup.Master3A;
    }
    if (master3bRegex.test(divisionName)) {
      return AgeGroup.Master3B;
    }
    if (master3Regex.test(divisionName)) {
      return AgeGroup.Master3;
    }
    if (master4aRegex.test(divisionName)) {
      return AgeGroup.Master4A;
    }
    if (master4bRegex.test(divisionName)) {
      return AgeGroup.Master4B;
    }
    if (master4Regex.test(divisionName)) {
      return AgeGroup.Master4;
    }
    if (master5aRegex.test(divisionName)) {
      return AgeGroup.Master5A;
    }
    if (master5bRegex.test(divisionName)) {
      return AgeGroup.Master5B;
    }
    if (master5Regex.test(divisionName)) {
      return AgeGroup.Master5;
    }
    if (master6aRegex.test(divisionName)) {
      return AgeGroup.Master6A;
    }
    if (master6bRegex.test(divisionName)) {
      return AgeGroup.Master6B;
    }
    if (master6Regex.test(divisionName)) {
      return AgeGroup.Master6;
    }
    if (guestRegex.test(divisionName)) {
      return AgeGroup.Guest;
    }
    if (collegiateRegex.test(divisionName)) {
      return AgeGroup.Collegiate;
    }
    if (highSchoolVarsityRegex.test(divisionName)) {
      return AgeGroup.HighSchoolVarsity;
    }
    if (highSchoolJuniorVarsityRegex.test(divisionName)) {
      return AgeGroup.HighSchoolJV;
    }
    if (highSchoolRegex.test(divisionName)) {
      return AgeGroup.HighSchool;
    }

    return AgeGroup.Unknown;
  }
}

type DivisionDetails = {
  gender: Gender;
  equipmentLevel: EquipmentLevel;
  ageGroup: AgeGroup;
};
