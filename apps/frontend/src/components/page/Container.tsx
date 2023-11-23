import { Container } from "@mantine/core";

type PageContainerProps = Parameters<typeof Container>[0];

const PageContainer = (props: PageContainerProps) => <Container maw="1280px" {...props} />;

export default PageContainer;
