import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Papa } from 'ngx-papaparse';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class AppComponent {
  public copyright: string = "2024";

  selectedFile: File | null = null;

  response: any | null = null;

  constructor(
    private http: HttpClient,
    private papa: Papa,
  ) {

    const currentYear  = new Date().getFullYear();
    if (currentYear != 2024) {
      this.copyright += ` - ${currentYear}`;
    } 
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit() {
    if (this.selectedFile) {
      const reader = new FileReader();

      reader.onload = (event: any) => {
        const csvData = event.target.result;
        this.parseCsv(csvData);
      };

      reader.readAsText(this.selectedFile);
    }
  }

  parseCsv(csvData: string) {
    this.papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        this.sendDataToApi(results.data.map((entry: any) => {
          let highSchoolIndex = ["In-State", "Out-of-state"].indexOf(entry.high_school);
          let leadConversationIndex = ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"].indexOf(entry.lead_conversation);
          let frequencyIndex = ["low", "medium", "high"].indexOf(entry.frequency);

          return {
            name: entry.name,
            email: entry.email,
            role: entry.role,
            mentee_limit: entry.mentee_limit === "null" ? null : Number(entry.mentee_limit),
            class_year: entry.class_year,
            major: entry.major,
            minor: entry.minor,
            high_school: highSchoolIndex > -1 ? highSchoolIndex : null,
            lead_conversation: leadConversationIndex > -1 ? leadConversationIndex : null,
            academic_goals: entry.academic_goals,
            professional_goals: entry.professional_goals,
            frequency: frequencyIndex > -1 ? frequencyIndex : null,
            involved_off_campus: entry.involved_off_campus,
            involved_on_campus: entry.involved_on_campus,
            curious: entry.curious,
            background: entry.background,
            gender: entry.gender,
            description: entry.description,
            identities: entry.identities,
          };
        }));
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
      }
    });
  }

  sendDataToApi(data: any[]) {
    //const apiUrl = 'https://park.api.ethanbaker.dev/api/v1/pairs';
    const apiUrl = 'http://localhost:8000/api/v1/pairs';

    console.log(data)

    this.http.post(apiUrl, data).subscribe({
      next: (response) => {
        console.log('Data successfully sent to API', response);
        this.response = response;
      },
      error: (error) => {
        console.error('Error sending data to API', error);
      }
    });
  }


}