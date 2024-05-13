import cron from "node-cron";
import { ScheduleService } from "@/queries/scheduler";
import Container, { Service } from "typedi";

@Service()
export class Scheduler {
    schedulers = Container.get(ScheduleService);

    public startCronJob() {
        cron.schedule("* * * * * *", async () => {
            try {
                await this.schedulers.updateUserPoints();
                console.log(`User points updated successfully`);
            } catch (error) {
                console.log(error);
            }
        });
    
        cron.schedule("* * * * * *", async () => {
            try {
              await this.schedulers.checkReferralHistory();
              console.log(`Referral history updated successfully`);
            } catch (error) {
                console.log(error);
            }
        });
    
        cron.schedule("* * * * * *", async () => {
            try {
              await this.schedulers.checkEventStatus();
              console.log(`Event status updated successfully`);
            } catch (error) {
                console.log(error);
            }
        });
    
        cron.schedule("* * * * * *", async () => {
            try {
              await this.schedulers.checkTicketAvailability();
              console.log(`Ticket availability updated successfully`);
            } catch (error) {
                console.log(error);
            }
        });
    
        cron.schedule("* * * * * *", async () => {
            try {
              await this.schedulers.checkPromotionStatus();
              console.log(`Promotion status updated successfully`);
            } catch (error) {
                console.log(error);
            }
        });
    
        cron.schedule("* * * * * *", async () => {
            try {
              await this.schedulers.checkTransactionStatus();
              console.log(`Transaction status updated successfully`);
            } catch (error) {
                console.log(error);
            }
        });
    }
}