import { Container } from '@mantine/core';

type PageContainerProps = Parameters<typeof Container>[0];

const PageContainer = (props: PageContainerProps) => (
  <Container maw="1280px" w="100%" style={{ flex: 1, flexDirection: "column" }} {...props} />
);

export default PageContainer;
